// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract FileAudit {
    event FileEvent(bytes32 indexed fileHash, address indexed user, uint8 action, uint256 timestamp, string meta);

    // action: 0=UPLOAD,1=REQUEST,2=APPROVE,3=DOWNLOAD,4=REVOKE
    function logEvent(bytes32 fileHash, uint8 action, string calldata meta) external {
        emit FileEvent(fileHash, msg.sender, action, block.timestamp, meta);
    }
}
