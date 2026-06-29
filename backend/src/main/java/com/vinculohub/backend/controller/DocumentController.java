/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.DocumentDownloadResponseDTO;
import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.service.DocumentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<?> uploadDocument(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("file") MultipartFile file,
            @Valid @RequestPart("data") DocumentRequestDTO dto) {
        DocumentResponseDTO response = documentService.upload(jwt.getSubject(), file, dto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-ong")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<Page<DocumentResponseDTO>> getAuthenticatedNpoDocuments(
            @AuthenticationPrincipal Jwt jwt,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        Page<DocumentResponseDTO> documents =
                documentService.findAllByAuthenticatedNpo(jwt.getSubject(), pageable);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/my-ong/{documentId}/download")
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<DocumentDownloadResponseDTO> downloadAuthenticatedNpoDocument(
            @AuthenticationPrincipal Jwt jwt, @PathVariable Integer documentId) {
        DocumentDownloadResponseDTO response =
                documentService.generateDownloadUrlForAuthenticatedNpo(
                        jwt.getSubject(), documentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('NPO')")
    public ResponseEntity<List<DocumentResponseDTO>> getDocuments(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) Integer projectId) {
        List<DocumentResponseDTO> documents =
                documentService.findAllByAuthenticatedNpo(jwt.getSubject(), projectId);
        return ResponseEntity.ok(documents);
    }
}
