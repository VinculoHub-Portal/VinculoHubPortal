/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.UserType;

public record AuthenticatedProfileResponse(
        String auth0Id,
        String email,
        Integer userId,
        UserType userType,
        Integer npoId,
        Integer companyId,
        boolean registrationCompleted) {}
