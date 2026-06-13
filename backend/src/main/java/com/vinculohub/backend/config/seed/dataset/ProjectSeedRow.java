/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProjectSeedRow(
        String key,
        String npoKey,
        String title,
        String description,
        ProjectStatus status,
        ProjectType type,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        LocalDate startDate,
        LocalDate endDate,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        String mainObjective,
        Integer progress) {}
