package com.shadow.fyp.service;

import com.shadow.fyp.model.FileEntity;
import com.shadow.fyp.model.AuditLog;
import com.shadow.fyp.repository.FileRepository;
import com.shadow.fyp.repository.AuditLogRepository;
import com.shadow.fyp.util.HashUtil;
import com.shadow.fyp.util.RequestContext;
import com.shadow.fyp.model.UserRole;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class FileService {
    private final MinioClient minioClient;
    private final FileRepository fileRepository;
    private final AuditLogRepository auditLogRepository;
    private final BlockchainService blockchainService;

    @Value("${minio.bucket}")
    private String bucket;

    public FileService(MinioClient minioClient, FileRepository fileRepository, 
                      AuditLogRepository auditLogRepository, BlockchainService blockchainService) {
        this.minioClient = minioClient;
        this.fileRepository = fileRepository;
        this.auditLogRepository = auditLogRepository;
        this.blockchainService = blockchainService;
    }

    public FileEntity uploadFile(MultipartFile multipartFile, Long ownerId) throws Exception {
        // save to temp
        Path temp = Files.createTempFile("upload-", multipartFile.getOriginalFilename());
        multipartFile.transferTo(temp.toFile());

        // compute hash
        try (InputStream is = Files.newInputStream(temp)) {
            String hexHash = HashUtil.sha256Hex(is);

            // upload to MinIO
            String objectName = hexHash + "-" + multipartFile.getOriginalFilename();
            try (InputStream uploadStream = Files.newInputStream(temp)) {
                minioClient.putObject(
                    PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectName)
                        .stream(uploadStream, Files.size(temp), -1)
                        .contentType(multipartFile.getContentType())
                        .build()
                );
            }

            // save metadata
            FileEntity fe = new FileEntity();
            fe.setFilename(multipartFile.getOriginalFilename());
            fe.setOwnerId(ownerId);
            fe.setFileHash(hexHash);
            fe.setStorageUrl(bucket + "/" + objectName);
            fe.setSize(multipartFile.getSize());
            fe.setContentType(multipartFile.getContentType());
            FileEntity savedFile = fileRepository.save(fe);

            // create audit row first
            AuditLog audit = new AuditLog();
            audit.setFileId(savedFile.getId());
            audit.setUserId(ownerId);
            audit.setAction("UPLOAD");
            audit.setPayload("{\"filename\":\""+savedFile.getFilename()+"\"}");
            audit = auditLogRepository.save(audit); // persist, get audit id

            // call blockchain async
            blockchainService.logFileEventAsync(savedFile.getFileHash(), ownerId, 0, "{\"fileId\":"+savedFile.getId()+"}", audit.getId());

            // cleanup temp
            Files.deleteIfExists(temp);

            // return metadata
            return savedFile;
        }
    }

    public void deleteFile(Long fileId) throws Exception {
        if (RequestContext.role() != UserRole.OWNER) {
            throw new SecurityException("Only owners can delete files");
        }
        FileEntity f = fileRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("File not found: " + fileId));

        // Remove from MinIO
        minioClient.removeObject(
            RemoveObjectArgs.builder()
                .bucket(bucket)
                .object(f.getStorageUrl().replace(bucket + "/", ""))
                .build()
        );

        // Audit log + blockchain
        AuditLog al = new AuditLog();
        al.setFileId(fileId);
        al.setUserId(RequestContext.userId());
        al.setAction("DELETE");
        al.setPayload("{\"filename\":\"" + f.getFilename() + "\"}");
        al = auditLogRepository.save(al);

        final Long auditId = al.getId();
        blockchainService.logFileEventAsync(f.getFileHash(), RequestContext.userId(), 4, 
            "{\"fileId\":" + fileId + "}", auditId);

        fileRepository.deleteById(fileId);
    }
}
