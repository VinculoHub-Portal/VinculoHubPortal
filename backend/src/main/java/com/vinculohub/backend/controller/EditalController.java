/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.EditalRequestDTO;
import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.service.EditalService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/editais")
@RequiredArgsConstructor
public class EditalController {

    private final EditalService editalService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EditalResponseDTO> create(
            @RequestPart("file") MultipartFile file, @RequestPart("data") EditalRequestDTO dto) {
        EditalResponseDTO response = editalService.create(file, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EditalResponseDTO>> listAll() {
        return ResponseEntity.ok(editalService.findAll());
    }
}
