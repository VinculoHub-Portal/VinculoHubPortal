/* (C)2026 */
package com.vinculohub.backend.dto;

public record SessionResponse(
        String userId,
        String email,
        String profileType,
        String displayName,
        String recommendedRedirect) {}
