/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
        @DecimalMin(value = "0.00", message = "Valor necessário não pode ser negativo")
                BigDecimal budgetNeeded,
        LocalDate startDate,
        LocalDate endDate,
        @NotEmpty(message = "ODS é obrigatório") List<Integer> odsIds,
        @NotNull(message = "Tipo de projeto é obrigatório") ProjectType type,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        @Size(max = 600, message = "Objetivo principal deve ter no máximo 600 caracteres")
                String mainObjective,
        @Min(value = 0, message = "Progresso não pode ser negativo")
                @Max(value = 100, message = "Progresso não pode ultrapassar 100")
                Integer progress) {}
