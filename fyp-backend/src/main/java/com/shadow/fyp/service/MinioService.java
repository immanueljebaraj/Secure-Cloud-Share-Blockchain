package com.shadow.fyp.service;

import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;

@Service
public class MinioService {
    private final MinioClient client;
    @Value("${minio.bucket:fyp-bucket}")
    private String bucket;

    public MinioService(@Value("${minio.url}") String url,
                        @Value("${minio.access.key}") String accessKey,
                        @Value("${minio.secret.key}") String secretKey) {
        this.client = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    // storageUrl expected format: "fyp-bucket/filename" or just filename
    public String generatePresignedUrl(String storageUrl, long expirySeconds) {
        try {
            String objectName = storageUrl.contains("/") ? storageUrl.substring(storageUrl.indexOf("/") + 1) : storageUrl;
            return client.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(objectName)
                            .expiry((int) Math.min(expirySeconds, TimeUnit.DAYS.toSeconds(7))) // minio max
                            .build()
            );
        } catch (Exception e) {
    e.printStackTrace();
    throw new RuntimeException("MinIO presign failed: " + e.getMessage());
}

    }
}
