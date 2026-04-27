/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Builder;

@Builder
public record ProjectSummaryDTO(
        Integer id,
        String title,
        String description,
        ProjectStatus status,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        LocalDate startDate,
        LocalDate endDate) {

    public static ProjectSummaryDTO from(Project project) {
        return ProjectSummaryDTO.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .budgetNeeded(project.getBudgetNeeded())
                .investedAmount(project.getInvestedAmount())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .build();
    }
}
