/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.RelationshipStatus;

public record EfetivarParceiraResponse(
        Integer companyId,
        Long projectId,
        RelationshipStatus status,
        boolean companyConfirmed,
        boolean npoConfirmed,
        String message) {}
