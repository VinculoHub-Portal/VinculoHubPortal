/* (C)2026 */
package com.vinculohub.backend.repository.projection;

import java.math.BigDecimal;

public interface EsgPillarAggregationProjection {
    String getPillar();

    Long getProjectCount();

    BigDecimal getTotalInvested();

    BigDecimal getTotalBudgetNeeded();
}
