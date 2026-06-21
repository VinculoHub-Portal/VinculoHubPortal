/* (C)2026 */
package com.vinculohub.backend.dto;

import lombok.Builder;

@Builder
public record NpoListItemResponse(
        Integer id,
        String name,
        String description,
        String logoUrl,
        String city,
        String stateCode) {}
