/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.service.DocumentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> uploadDocument(
            @RequestPart("file") MultipartFile file, @RequestPart("data") DocumentRequestDTO dto) {
        DocumentResponseDTO response = documentService.upload(file, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DocumentResponseDTO>> getDocuments(
            @RequestParam(required = false) Integer npoId,
            @RequestParam(required = false) Integer projectId) {

        List<DocumentResponseDTO> documents = documentService.findAll(npoId, projectId);

        return ResponseEntity.ok(documents);
    }
}