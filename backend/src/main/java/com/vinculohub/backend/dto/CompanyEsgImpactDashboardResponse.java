/* (C)2026 */
package com.vinculohub.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record CompanyEsgImpactDashboardResponse(
        long projectCount,
        BigDecimal totalInvested,
        BigDecimal totalBudgetNeeded,
        List<EsgPillarImpactDTO> pillars) {}
