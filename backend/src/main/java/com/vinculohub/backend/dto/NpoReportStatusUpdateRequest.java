/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.NpoReportStatus;
import jakarta.validation.constraints.NotNull;

public record NpoReportStatusUpdateRequest(
        @NotNull(message = "O status da denúncia é obrigatório.") NpoReportStatus status) {}
