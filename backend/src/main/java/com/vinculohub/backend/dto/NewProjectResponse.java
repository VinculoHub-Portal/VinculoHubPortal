/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;

public record NewProjectResponse(
        Long id,
        String name,
        String description,
        ProjectType type,
        BigDecimal capital,
        Integer npoId) {}
