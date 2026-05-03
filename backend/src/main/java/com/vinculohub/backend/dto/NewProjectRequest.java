/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.util.List;

public record NewProjectRequest(
        String name, String description, ProjectType type, BigDecimal capital, List<String> ods) {}
