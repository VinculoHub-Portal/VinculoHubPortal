/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;

public record CompanyProjectSeedRow(
        String companyKey,
        String projectKey,
        RelationshipStatus status,
        InitiatorType initiatorType,
        LocalDateTime companyConfirmedAt,
        LocalDateTime npoConfirmedAt,
        LocalDateTime respondedAt,
        LocalDateTime expiresAt) {}
