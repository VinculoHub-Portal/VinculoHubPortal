/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.EsgPillar;
import java.math.BigDecimal;

public record EsgPillarImpactDTO(
        EsgPillar pillar,
        String label,
        long projectCount,
        BigDecimal totalInvested,
        BigDecimal budgetNeeded,
        BigDecimal investmentPercentage) {}
