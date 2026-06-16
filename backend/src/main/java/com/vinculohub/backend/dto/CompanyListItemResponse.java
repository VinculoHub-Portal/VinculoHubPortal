/* (C)2026 */
package com.vinculohub.backend.dto;

import lombok.Builder;

@Builder
public record CompanyListItemResponse(
        Integer id,
        String legalName,
        String socialName,
        String description,
        String logoUrl,
        String city,
        String state) {}
