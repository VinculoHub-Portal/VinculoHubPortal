/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;

public record AdminNpoCardResponse(
        Integer id,
        String name,
        String logoUrl,
        boolean active,
        boolean environmental,
        boolean social,
        boolean governance,
        String city,
        String stateCode,
        LocalDateTime createdAt) {}
