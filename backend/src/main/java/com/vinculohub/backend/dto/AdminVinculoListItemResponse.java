/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;

public record AdminVinculoListItemResponse(
        Integer companyId,
        String companyName,
        Long projectId,
        String projectTitle,
        Integer npoId,
        String npoName,
        RelationshipStatus status,
        LocalDateTime createdAt) {

    public static AdminVinculoListItemResponse from(CompanyProject cp) {
        return new AdminVinculoListItemResponse(
                cp.getCompany().getId(),
                cp.getCompany().getLegalName(),
                cp.getProject().getId(),
                cp.getProject().getTitle(),
                cp.getProject().getNpo().getId(),
                cp.getProject().getNpo().getName(),
                cp.getStatus(),
                cp.getCreatedAt());
    }
}
