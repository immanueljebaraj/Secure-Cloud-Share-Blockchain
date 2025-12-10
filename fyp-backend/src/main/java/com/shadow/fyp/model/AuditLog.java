package com.shadow.fyp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long fileId;
    private Long userId;
    private String action; // "UPLOAD", "REQUEST", etc.
    private String txHash;
    private Long blockNumber;
    @Column(columnDefinition = "TEXT")
    private String payload;
    private Instant createdAt = Instant.now();
}
