/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import java.util.Set;

public record ProjectFilterParams(
        Long npoId, ProjectStatus status, String title, Set<Integer> odsCodes, ProjectType type) {}
