package com.shadow.fyp.service;

import com.shadow.fyp.model.AuditLog;
import com.shadow.fyp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Bytes32;
import org.web3j.abi.datatypes.generated.Uint8;
import org.web3j.crypto.*;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;
import org.web3j.protocol.core.methods.response.EthSendTransaction;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.tx.response.TransactionReceiptProcessor;
import org.web3j.tx.gas.DefaultGasProvider;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class BlockchainService {
    private final Web3j web3;
    private final RawTransactionManager txManager;
    private final String contractAddress;
    private final AuditLogRepository auditLogRepository;
    private final TransactionReceiptProcessor receiptProcessor;
    private final String privateKey;
    private final long chainId;

    public BlockchainService(@Value("${web3.rpc.url:http://127.0.0.1:8545}") String rpcUrl,
                             @Value("${web3.private.key:}") String privateKey,
                             @Value("${web3.contract.address:}") String contractAddress,
                             AuditLogRepository auditLogRepository) {
        this.web3 = Web3j.build(new HttpService(rpcUrl));
        this.contractAddress = contractAddress;
        this.auditLogRepository = auditLogRepository;
        this.privateKey = privateKey.startsWith("0x") ? privateKey : "0x" + privateKey;

        Credentials creds = Credentials.create(this.privateKey);

        // Polling receipt processor: poll every 1s, up to 40 attempts (adjust if you want)
        this.receiptProcessor = new PollingTransactionReceiptProcessor(web3, 1000, 40);

        // chainId (Ganache default 1337) — keep in sync with eth_chainId
        this.chainId = 1337L;

        this.txManager = new RawTransactionManager(web3, creds, chainId, receiptProcessor);
    }

    /**
     * Log a file event asynchronously and update audit_log with txHash & blockNumber.
     */
    public CompletableFuture<String> logFileEventAsync(String fileHashHex, long userId, int actionCode, String metaJson, Long auditLogId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // normalize hex
                String hexWith0x = fileHashHex.startsWith("0x") ? fileHashHex : "0x" + fileHashHex;
                byte[] raw = Numeric.hexStringToByteArray(hexWith0x);
                if (raw.length != 32) {
                    byte[] tmp = new byte[32];
                    System.arraycopy(raw, 0, tmp, 32 - raw.length, raw.length);
                    raw = tmp;
                }

                Bytes32 fileHashParam = new Bytes32(raw);
                Uint8 actionParam = new Uint8(BigInteger.valueOf(actionCode));
                Utf8String metaParam = new Utf8String(metaJson == null ? "" : metaJson);

                Function fn = new Function(
                        "logEvent",
                        Arrays.asList(fileHashParam, actionParam, metaParam),
                        Collections.emptyList()
                );

                String encoded = FunctionEncoder.encode(fn);

                // debug info
                Credentials creds = Credentials.create(privateKey);
                System.out.println("DEBUG: BlockchainService signing address = " + creds.getAddress());
                System.out.println("DEBUG: Contract address configured = " + contractAddress);

                // Try the standard send via txManager first
                BigInteger gasPrice = DefaultGasProvider.GAS_PRICE;
                BigInteger gasLimit;
                try {
                    // fetch latest block to get its gas limit
                    org.web3j.protocol.core.methods.response.EthBlock latest = web3.ethGetBlockByNumber(DefaultBlockParameterName.LATEST, false).send();
                    BigInteger blockGasLimit = latest.getBlock().getGasLimit();
                    // reserve a margin so we don't equal/exceed the block limit
                    BigInteger margin = BigInteger.valueOf(10_000L);
                    if (blockGasLimit.compareTo(margin) > 0) {
                        gasLimit = blockGasLimit.subtract(margin);
                    } else {
                        // fallback if blockGasLimit unexpectedly tiny
                        gasLimit = BigInteger.valueOf(1_000_000L);
                    }
                } catch (Exception ex) {
                    // if RPC fails for gas info, fall back to a conservative safe default
                    gasLimit = BigInteger.valueOf(1_000_000L);
                    System.out.println("WARN: Couldn't get block gas limit, using fallback gasLimit=" + gasLimit);
                }

                EthSendTransaction ethSend = txManager.sendTransaction(
                        gasPrice,
                        gasLimit,
                        contractAddress,
                        encoded,
                        BigInteger.ZERO
                );

                if (ethSend != null) {
                    System.out.println("DEBUG: ethSend.toString(): " + ethSend.toString());
                    if (ethSend.getError() != null) {
                        System.out.println("DEBUG: ethSend error message: " + ethSend.getError().getMessage());
                        System.out.println("DEBUG: ethSend error data: " + ethSend.getError().getData());
                    }
                } else {
                    System.out.println("DEBUG: ethSend is NULL (no response from txManager.sendTransaction).");
                }

                String txHash = (ethSend != null) ? ethSend.getTransactionHash() : null;

                // Fallback: if no txHash or an error from the node, sign locally and use eth_sendRawTransaction
                if (txHash == null || (ethSend != null && ethSend.getError() != null)) {
                    System.out.println("DEBUG: Falling back to local signing + eth_sendRawTransaction");

                    // get nonce
                    EthGetTransactionCount nonceResp = web3.ethGetTransactionCount(
                            creds.getAddress(), DefaultBlockParameterName.PENDING).send();
                    BigInteger nonce = nonceResp.getTransactionCount();

                    // Use the same gasPrice and gasLimit logic for fallback
                    RawTransaction rawTx = RawTransaction.createTransaction(
                            nonce,
                            gasPrice,
                            gasLimit,
                            contractAddress,
                            BigInteger.ZERO,
                            encoded
                    );

                    byte[] signedMessage = TransactionEncoder.signMessage(rawTx, chainId, creds);
                    String hexValue = Numeric.toHexString(signedMessage);

                    EthSendTransaction rawSendResp = web3.ethSendRawTransaction(hexValue).send();
                    System.out.println("DEBUG: rawSendResp: " + rawSendResp.toString());
                    if (rawSendResp.getError() != null) {
                        System.out.println("DEBUG: rawSendResp error: " + rawSendResp.getError().getMessage());
                        System.out.println("DEBUG: rawSendResp error data: " + rawSendResp.getError().getData());
                    }
                    txHash = rawSendResp.getTransactionHash();
                }

                if (txHash == null) {
                    // mark failure in audit log for debugging
                    Optional<AuditLog> maybeFail = auditLogRepository.findById(auditLogId);
                    AuditLog failLog = maybeFail.orElseGet(AuditLog::new);
                    failLog.setTxHash("FAILED_TO_SEND");
                    auditLogRepository.save(failLog);
                    System.out.println("DEBUG: Transaction sending failed (txHash null). Audit updated with FAILED_TO_SEND.");
                    return null;
                }

                // Wait for mined receipt
                TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(txHash);
                Long blockNumber = receipt.getBlockNumber() != null ? receipt.getBlockNumber().longValue() : null;

                // Update audit_log
                Optional<AuditLog> maybe = auditLogRepository.findById(auditLogId);
                AuditLog al = maybe.orElseGet(AuditLog::new);
                al.setTxHash(txHash);
                al.setBlockNumber(blockNumber);
                auditLogRepository.save(al);

                System.out.println("DEBUG: Transaction successful. txHash=" + txHash + " block=" + blockNumber);
                return txHash;
            } catch (Exception e) {
                e.printStackTrace();
                try {
                    Optional<AuditLog> maybe = auditLogRepository.findById(auditLogId);
                    AuditLog al = maybe.orElseGet(AuditLog::new);
                    al.setTxHash("ERROR");
                    auditLogRepository.save(al);
                } catch (Exception ignored) {}
                return null;
            }
        });
    }
}
