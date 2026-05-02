/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ProjectCreateRequest(
        @NotBlank(message = "Título é obrigatório")
                @Size(max = 255, message = "Título deve ter no máximo 255 caracteres")
                String title,
        @NotBlank(message = "Resumo é obrigatório")
                @Size(min = 50, max = 500, message = "Resumo deve ter entre 50 e 500 caracteres")
                String description,
        @NotNull(message = "Valor necessário é obrigatório")
                @DecimalMin(value = "0.00", message = "Valor necessário não pode ser negativo")
                BigDecimal budgetNeeded,
        LocalDate startDate,
        LocalDate endDate,
        @NotEmpty(message = "ODS é obrigatório") List<Integer> odsIds) {}
