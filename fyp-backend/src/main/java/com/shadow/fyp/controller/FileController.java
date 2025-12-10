package com.shadow.fyp.controller;

import com.shadow.fyp.model.FileEntity;
import com.shadow.fyp.service.FileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) { this.fileService = fileService; }

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file,
                                    @RequestParam(value = "ownerId", required = false) Long ownerId) {
        try {
            if (ownerId == null) ownerId = 1L; // default demo owner
            FileEntity fe = fileService.uploadFile(file, ownerId);
            return ResponseEntity.ok(fe);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Upload failed: " + e.getMessage());
        }
    }
}
