/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.EditalRequestDTO;
import com.vinculohub.backend.dto.EditalResponseDTO;
import com.vinculohub.backend.service.EditalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
    public ResponseEntity<Page<EditalResponseDTO>> listAll(
            @RequestParam(name = "active", required = false, defaultValue = "false")
                    boolean activeOnly,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC)
                    Pageable pageable) {
        var result =
                activeOnly
                        ? editalService.findAllActive(pageable)
                        : editalService.findAll(pageable);
        return ResponseEntity.ok(result);
    }
}
