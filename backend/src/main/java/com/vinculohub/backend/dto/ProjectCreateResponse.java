/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.Builder;

@Builder
public record ProjectCreateResponse(
        Long id,
        Integer npoId,
        String title,
        String description,
        ProjectStatus status,
        ProjectType type,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        LocalDate startDate,
        LocalDate endDate,
        List<OdsResponse> ods,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        String mainObjective) {}
