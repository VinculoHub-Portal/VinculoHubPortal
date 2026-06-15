/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CreateRelationshipRequest;
import com.vinculohub.backend.dto.RelationshipListItemResponse;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.service.RelationshipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * "Meus Vínculos" — central management of partnerships between Companies and NPOs (Épico Vínculos,
 * VNC-01..04). The authenticated actor (Company or NPO) is resolved server-side; participant and
 * receptor checks live in {@link RelationshipService}.
 */
@Slf4j
@RestController
@RequestMapping("/api/relationships")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Vínculos", description = "Gestão de vínculos (parcerias) entre Empresas e ONGs")
public class RelationshipController {

    private final RelationshipService relationshipService;

    @GetMapping
    @Operation(
            summary = "Listar Meus Vínculos (VNC-01)",
            description =
                    "Lista os vínculos visíveis (pendentes, em negociação e ativos) do ator"
                            + " autenticado, opcionalmente filtrando por status.")
    public ResponseEntity<List<RelationshipListItemResponse>> listMyRelationships(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) RelationshipStatus status) {
        log.info("GET /api/relationships | sub={} status={}", jwt.getSubject(), status);
        return ResponseEntity.ok(relationshipService.listMyRelationships(jwt.getSubject(), status));
    }

    @PostMapping
    @Operation(
            summary = "Iniciar vínculo — 1º aperto de mão, envio (VNC-02)",
            description =
                    "Cria um vínculo com status 'pending' atrelado a um projeto. Empresa: informa"
                        + " apenas o projeto. ONG: informa um projeto próprio + a empresa alvo.")
    public ResponseEntity<Void> createRelationship(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateRelationshipRequest request) {
        log.info(
                "POST /api/relationships | sub={} projectId={} companyId={}",
                jwt.getSubject(),
                request.projectId(),
                request.companyId());
        relationshipService.createRelationship(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PostMapping("/{companyId}/{projectId}/accept")
    @Operation(
            summary = "Aceitar contato — 1º aperto de mão, resposta (VNC-03)",
            description =
                    "Receptor aceita o interesse: status passa a 'negotiation' e os contatos de"
                            + " ambas as partes são revelados mutuamente.")
    public ResponseEntity<Void> acceptRelationship(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer companyId,
            @PathVariable Long projectId) {
        log.info(
                "POST /api/relationships/{}/{}/accept | sub={}",
                companyId,
                projectId,
                jwt.getSubject());
        relationshipService.acceptRelationship(jwt.getSubject(), companyId, projectId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{companyId}/{projectId}/reject")
    @Operation(
            summary = "Recusar — 1º aperto de mão, resposta (VNC-03)",
            description = "Receptor recusa o interesse: o vínculo é encerrado (status 'inactive').")
    public ResponseEntity<Void> rejectRelationship(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer companyId,
            @PathVariable Long projectId) {
        log.info(
                "POST /api/relationships/{}/{}/reject | sub={}",
                companyId,
                projectId,
                jwt.getSubject());
        relationshipService.rejectRelationship(jwt.getSubject(), companyId, projectId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{companyId}/{projectId}/confirm")
    @Operation(
            summary = "Efetivar parceria — 2º aperto de mão (VNC-04)",
            description =
                    "Registra a confirmação do ator. Quando ambas as partes confirmam, o status"
                            + " passa a 'active' e o vínculo alimenta o Dashboard de Impacto ESG.")
    public ResponseEntity<Void> confirmRelationship(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Integer companyId,
            @PathVariable Long projectId) {
        log.info(
                "POST /api/relationships/{}/{}/confirm | sub={}",
                companyId,
                projectId,
                jwt.getSubject());
        relationshipService.confirmRelationship(jwt.getSubject(), companyId, projectId);
        return ResponseEntity.ok().build();
    }
}
