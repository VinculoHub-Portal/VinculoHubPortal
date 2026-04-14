/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder
public record UserDTO(@NotEmpty String name, @NotEmpty @Email String email) {}
