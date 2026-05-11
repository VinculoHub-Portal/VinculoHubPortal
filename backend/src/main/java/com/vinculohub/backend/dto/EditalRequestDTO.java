/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record EditalRequestDTO(@NotBlank String title, String description) {}
