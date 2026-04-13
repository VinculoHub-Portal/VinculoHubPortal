package com.vinculohub.backend.dto;

import lombok.Builder;
import com.vinculohub.backend.model.UserType;

@Builder
public record UsersDTO(
        Integer id,
        String name,
        String email,
        UserType userType
) {}