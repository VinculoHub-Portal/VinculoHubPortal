/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.NpoReportStatus;

public record NpoReportSeedRow(
        String key,
        String npoKey,
        String reporterCompanyKey,
        String reason,
        NpoReportStatus status) {}
