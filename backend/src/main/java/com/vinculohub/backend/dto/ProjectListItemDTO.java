/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.time.LocalDate;

public record ProjectListItemDTO(
        Long id,
        String title,
        String description,
        ProjectStatus status,
        ProjectType type,
        Integer npoId,
        String npoName,
        String npoPhone,
        LocalDate startDate,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        String mainObjective) {

    public static ProjectListItemDTO from(Project project) {
        return new ProjectListItemDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStatus(),
                project.getType(),
                project.getNpo().getId(),
                project.getNpo().getName(),
                project.getNpo().getPhone(),
                project.getStartDate(),
                project.getBudgetNeeded(),
                project.getInvestedAmount(),
                project.getFocusArea(),
                project.getFundraisingDeadline(),
                project.getBeneficiariesCount(),
                project.getLocation(),
                project.getMainObjective());
    }
}
