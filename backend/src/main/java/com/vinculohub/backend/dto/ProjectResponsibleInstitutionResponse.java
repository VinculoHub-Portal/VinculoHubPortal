/* (C)2026 */
package com.vinculohub.backend.dto;

public record ProjectResponsibleInstitutionResponse(
        Integer npoId,
        String name,
        String logoUrl,
        String city,
        String stateCode,
        String description) {}
