/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;

public record AdminRelationshipResponse(
        Integer companyId,
        String companyName,
        String companyEmail,
        Integer npoId,
        String npoName,
        String npoEmail,
        Long projectId,
        String projectTitle,
        RelationshipStatus status,
        InitiatorType initiatorType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime respondedAt,
        LocalDateTime companyConfirmedAt,
        LocalDateTime npoConfirmedAt) {}
