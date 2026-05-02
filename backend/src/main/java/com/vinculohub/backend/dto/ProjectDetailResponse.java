/* (C)2026 */
package com.vinculohub.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public record ProjectDetailResponse(
        Long id,
        String title,
        String description,
        String status,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        Set<Integer> odsCodes,
        LocalDate startDate,
        LocalDate endDate) {}
