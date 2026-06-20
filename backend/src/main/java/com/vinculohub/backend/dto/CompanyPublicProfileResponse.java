/* (C)2026 */
package com.vinculohub.backend.dto;

public record CompanyPublicProfileResponse(
        Integer id,
        String legalName,
        String socialName,
        String description,
        String logoUrl,
        String city,
        String stateCode,
        String segment,
        String website) {}
