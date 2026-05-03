/* (C)2026 */
package com.vinculohub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectDetailResponse(
        Long id,
        String title,
        String description,
        String status,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        List<OdsResponse> ods,
        LocalDate startDate,
        LocalDate endDate) {}
