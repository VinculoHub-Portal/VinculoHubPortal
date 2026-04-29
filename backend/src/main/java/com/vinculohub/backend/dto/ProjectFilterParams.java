/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.ProjectStatus;

public record ProjectFilterParams(Long npoId, ProjectStatus status, String title) {}
