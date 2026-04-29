/* (C)2026 */
package com.vinculohub.backend.dto;

public record NpoInstitutionalSignupResponse(
        Integer userId, Integer npoId, Long projectId, String email, boolean accessReleased) {}
