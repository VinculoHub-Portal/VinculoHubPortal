/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder
public record UsersDTO(
        @NotEmpty String firstName,
        @NotEmpty String lastName,
        @NotEmpty @Email String email,
        @NotEmpty String password,
        @NotEmpty String userType) {}
