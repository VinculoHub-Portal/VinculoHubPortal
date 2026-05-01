/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.time.LocalDate;

public record ProjectListItemDTO(
        Long id,
        String title,
        ProjectStatus status,
        Integer npoId,
        String npoName,
        String npoPhone,
        LocalDate startDate) {

    public static ProjectListItemDTO from(Project project) {
        return new ProjectListItemDTO(
                project.getId(),
                project.getTitle(),
                project.getStatus(),
                project.getNpo().getId(),
                project.getNpo().getName(),
                project.getNpo().getPhone(),
                project.getStartDate());
    }
}
