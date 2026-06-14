/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.EfetivarParceiraResponse;
import com.vinculohub.backend.dto.VinculoResponse;
import com.vinculohub.backend.service.VinculoService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/me/vinculos")
@RequiredArgsConstructor
public class VinculoController {

    private final VinculoService vinculoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'NPO')")
    public ResponseEntity<List<VinculoResponse>> listVinculos(
            @AuthenticationPrincipal Jwt jwt) {
        log.info("GET /api/me/vinculos | sub={}", jwt.getSubject());
        return ResponseEntity.ok(vinculoService.listVinculosForUser(jwt.getSubject()));
    }

    @PostMapping("/{companyId}/{projectId}/efetivar")
    @PreAuthorize("hasAnyRole('COMPANY', 'NPO')")
    public ResponseEntity<EfetivarParceiraResponse> efetivarParceria(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer companyId,
            @PathVariable Long projectId) {
        log.info(
                "POST /api/me/vinculos/{}/{}/efetivar | sub={}",
                companyId,
                projectId,
                jwt.getSubject());
        return ResponseEntity.ok(
                vinculoService.efetivarParceria(jwt.getSubject(), companyId, projectId));
    }
}
