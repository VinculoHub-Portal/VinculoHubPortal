/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record EditalRequestDTO(@NotBlank String title, String description, List<Integer> odsIds) {}
