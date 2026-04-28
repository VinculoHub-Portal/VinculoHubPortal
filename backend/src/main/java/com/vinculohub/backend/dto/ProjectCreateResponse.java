/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record ProjectCreateResponse(
        Integer id,
        Integer npoId,
        String title,
        String description,
        ProjectStatus status,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        LocalDate startDate,
        LocalDate endDate,
        List<OdsResponse> ods,
        LocalDateTime createdAt) {}
