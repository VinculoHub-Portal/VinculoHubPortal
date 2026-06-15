/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.OverduePartnershipAlertResponse;
import com.vinculohub.backend.service.RelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints de administração relacionados a vínculos (ADM-06). */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin — Vínculos", description = "Monitoramento de vínculos pelo administrador")
public class AdminRelationshipController {

    private final RelationshipService relationshipService;

    @GetMapping("/relationships/overdue")
    @Operation(
            summary = "Vínculos pendentes vencidos (ADM-06)",
            description =
                    "Lista vínculos com status 'pending' há mais de 7 dias sem resposta da ONG,"
                            + " permitindo mediação pelo administrador.")
    public ResponseEntity<List<OverduePartnershipAlertResponse>> listOverdueRelationships() {
        log.info("GET /api/admin/relationships/overdue");
        return ResponseEntity.ok(relationshipService.listOverdueRelationshipsForAdmin());
    }
}
