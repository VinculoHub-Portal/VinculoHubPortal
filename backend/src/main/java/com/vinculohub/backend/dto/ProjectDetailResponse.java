/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectDetailResponse(
        Long id,
        String title,
        String description,
        String status,
        ProjectType type,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        List<OdsResponse> ods,
        LocalDate startDate,
        LocalDate endDate,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        String mainObjective) {}
