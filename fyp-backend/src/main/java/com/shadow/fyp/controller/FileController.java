package com.shadow.fyp.controller;

import com.shadow.fyp.model.FileEntity;
import com.shadow.fyp.service.FileService;
import com.shadow.fyp.repository.FileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private final FileService fileService;
    private final FileRepository fileRepository;

    public FileController(FileService fileService, FileRepository fileRepository) {
        this.fileService = fileService;
        this.fileRepository = fileRepository;
    }

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

    @GetMapping
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }
    
}
