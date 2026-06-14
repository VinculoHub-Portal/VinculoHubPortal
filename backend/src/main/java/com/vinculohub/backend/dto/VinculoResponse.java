/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.RelationshipStatus;

public record VinculoResponse(
        Integer companyId,
        Long projectId,
        String projectTitle,
        String companyName,
        String npoName,
        String companyEmail,
        String npoEmail,
        RelationshipStatus status,
        boolean companyConfirmed,
        boolean npoConfirmed,
        boolean currentUserConfirmed) {}
