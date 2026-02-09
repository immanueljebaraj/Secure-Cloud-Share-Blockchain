package com.shadow.fyp.controller;

import com.shadow.fyp.model.AuditLog;
import com.shadow.fyp.repository.AuditLogRepository;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {

    private final AuditLogRepository repo;

    public AuditLogController(AuditLogRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<AuditLog> all() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
