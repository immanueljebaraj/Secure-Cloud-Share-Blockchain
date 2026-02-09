package com.shadow.fyp.service;

import com.shadow.fyp.model.AccessRequest;
import com.shadow.fyp.repository.AccessRequestRepository;
import com.shadow.fyp.repository.FileRepository;
import com.shadow.fyp.model.FileEntity;
import com.shadow.fyp.repository.AuditLogRepository;
import com.shadow.fyp.model.AuditLog;
import com.shadow.fyp.util.RequestContext;
import com.shadow.fyp.model.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class AccessRequestService {

    private final AccessRequestRepository requestRepo;
    private final FileRepository fileRepo;
    private final AuditLogRepository auditLogRepository;
    private final BlockchainService blockchainService;
    private final MinioService minioService; // ensure this class exists

    @Value("${minio.presign.expiry.seconds:300}")
    private long presignExpiry;

    public AccessRequestService(AccessRequestRepository requestRepo,
                                FileRepository fileRepo,
                                AuditLogRepository auditLogRepository,
                                BlockchainService blockchainService,
                                MinioService minioService) {
        this.requestRepo = requestRepo;
        this.fileRepo = fileRepo;
        this.auditLogRepository = auditLogRepository;
        this.blockchainService = blockchainService;
        this.minioService = minioService;
    }

    // Create a new access request (vendor asks)
    @Transactional
    public AccessRequest createRequest(Long fileId, String reason) {
        if (RequestContext.role() != UserRole.VENDOR) {
            throw new SecurityException("Only vendors can request access");
        }
        Long requesterId = RequestContext.userId();
        FileEntity f = fileRepo.findById(fileId).orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));
        AccessRequest req = new AccessRequest();
        req.setFileId(fileId);
        req.setRequesterId(requesterId);
        req.setOwnerId(f.getOwnerId());
        req.setReason(reason);
        req.setCreatedAt(Instant.now());
        req = requestRepo.save(req);

        // DB audit row & chain log: ACTION = REQUEST (actionCode 1)
        AuditLog al = new AuditLog();
        al.setFileId(fileId);
        al.setUserId(requesterId);
        al.setAction("REQUEST");
        al.setPayload("{\"requestId\":" + req.getId() + "}");
        al = auditLogRepository.save(al);

        // make auditId effectively final for any lambda capture
        final Long auditId = al.getId();

        // fire-and-forget: log to blockchain asynchronously
        blockchainService.logFileEventAsync(f.getFileHash(), requesterId, 1, "{\"requestId\":" + req.getId() + "}", auditId);

        return req;
    }

    // Approve request (owner approves)
    @Transactional
    public AccessRequest approve(Long requestId) throws Exception {
        if (RequestContext.role() != UserRole.OWNER) {
            throw new SecurityException("Only owners can approve");
        }
        Long approverId = RequestContext.userId();
        AccessRequest req = requestRepo.findById(requestId).orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!req.getOwnerId().equals(approverId)) throw new IllegalAccessException("Not owner");

        FileEntity f = fileRepo.findById(req.getFileId()).orElseThrow(() -> new IllegalArgumentException("File not found: " + req.getFileId()));

        String presigned = minioService.generatePresignedUrl(f.getStorageUrl(), presignExpiry);
        req.setPresignedUrl(presigned);
        req.setStatus(AccessRequest.Status.APPROVED);
        req.setUpdatedAt(Instant.now());
        AccessRequest savedReq = requestRepo.save(req);

        // audit & chain log: ACTION = APPROVE (actionCode 2)
        AuditLog al = new AuditLog();
        al.setFileId(f.getId());
        al.setUserId(approverId);
        al.setAction("APPROVE");
        al.setPayload("{\"requestId\":" + savedReq.getId() + "}");
        al = auditLogRepository.save(al);

        final Long auditId = al.getId();
        blockchainService.logFileEventAsync(f.getFileHash(), approverId, 2, "{\"requestId\":" + savedReq.getId() + "}", auditId);

        return savedReq;
    }

    // Reject request (owner rejects)
    @Transactional
    public AccessRequest reject(Long requestId) throws Exception {
        if (RequestContext.role() != UserRole.OWNER) {
            throw new SecurityException("Only owners can approve");
        }
        Long approverId = RequestContext.userId();
        AccessRequest req = requestRepo.findById(requestId).orElseThrow(() -> new IllegalArgumentException("Request not found: " + requestId));
        if (!req.getOwnerId().equals(approverId)) throw new IllegalAccessException("Not owner");
        req.setStatus(AccessRequest.Status.REJECTED);
        req.setUpdatedAt(Instant.now());
        req = requestRepo.save(req);

        // audit & chain log: ACTION = REJECT (actionCode 3)
        AuditLog al = new AuditLog();
        al.setFileId(req.getFileId());
        al.setUserId(approverId);
        al.setAction("REJECT");
        al.setPayload("{\"requestId\":" + req.getId() + "}");
        al = auditLogRepository.save(al);

        final Long auditId = al.getId();
        blockchainService.logFileEventAsync(
                fileRepo.findById(req.getFileId()).orElseThrow().getFileHash(),
                approverId, 3, "{\"requestId\":" + req.getId() + "}", auditId);

        return req;
    }

    // Helper read methods for controller
    public List<AccessRequest> findByOwner(Long ownerId) {
        return requestRepo.findByOwnerId(ownerId);
    }

    public List<AccessRequest> findByRequester(Long requesterId) {
        return requestRepo.findByRequesterId(requesterId);
    }
}
