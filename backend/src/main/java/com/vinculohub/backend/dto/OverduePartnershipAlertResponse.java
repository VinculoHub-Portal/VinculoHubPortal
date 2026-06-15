/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;

/** Alerta exibido no painel do administrador para vínculos pendentes há mais de 7 dias (ADM-06). */
public record OverduePartnershipAlertResponse(
        Integer companyId,
        String companyName,
        Integer npoId,
        String npoName,
        Long projectId,
        String projectName,
        LocalDateTime requestedAt) {}
