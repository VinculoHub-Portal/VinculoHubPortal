/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ProjectDetailResponse(
        Long id,
        String title,
        String description,
        String status,
        ProjectType type,
        BigDecimal budgetNeeded,
        BigDecimal investedAmount,
        List<OdsResponse> ods,
        LocalDate startDate,
        LocalDate endDate,
        String focusArea,
        String fundraisingDeadline,
        Integer beneficiariesCount,
        String location,
        String mainObjective,
        ProjectResponsibleInstitutionResponse responsibleInstitution 
                                ) {

         public static ProjectDetailResponse from(Project project, List<OdsResponse> odsList) {
    ProjectResponsibleInstitutionResponse institutionResponse = null;


    if (project.getNpo() != null) {
        String city = null;
        String stateCode = null;
        String logoUrl = null;


        if (project.getNpo().getAddress() != null) {
            city = project.getNpo().getAddress().getCity();
            stateCode = project.getNpo().getAddress().getStateCode();
        }
        
        if (project.getNpo().getLogoUrl()!= null){
                logoUrl = project.getNpo().getLogoUrl();
        }

        institutionResponse = new ProjectResponsibleInstitutionResponse(
                project.getNpo().getName(),
                logoUrl, 
                city,
                stateCode,
                project.getNpo().getDescription()
        );
    }

    return new ProjectDetailResponse(
            project.getId(),
            project.getTitle(),
            project.getDescription(),
            project.getStatus() != null ? project.getStatus().name() : null,
            project.getType(),
            project.getBudgetNeeded(),
            project.getInvestedAmount(),
            odsList,
            project.getStartDate(),
            project.getEndDate(),
            project.getFocusArea(),
            project.getFundraisingDeadline(),
            project.getBeneficiariesCount(),
            project.getLocation(),
            project.getMainObjective(),
            institutionResponse
    );
}
                                }
