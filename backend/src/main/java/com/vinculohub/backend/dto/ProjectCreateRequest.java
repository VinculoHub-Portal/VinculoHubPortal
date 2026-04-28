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
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(min = 50, max = 500) String description,
        @NotNull @DecimalMin("0.00") BigDecimal budgetNeeded,
        LocalDate startDate,
        LocalDate endDate,
        @NotEmpty List<Integer> odsIds) {}
