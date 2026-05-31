/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NpoReportCreateRequest(
        @NotBlank(message = "O motivo da denúncia é obrigatório.")
                @Size(
                        min = 10,
                        max = 1000,
                        message = "O motivo deve ter entre 10 e 1000 caracteres.")
                String reason) {}
