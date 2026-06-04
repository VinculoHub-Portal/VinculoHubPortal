/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.RelationshipStatus;

public record RelationshipListItemResponse(
        Long projectId,
        String projectName,
        Integer partnerInstitutionId,
        String partnerInstitutionName,
        RelationshipStatus status) {}
