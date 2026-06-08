/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.RelationshipStatus;
import lombok.Builder;

@Builder
public record VinculoExportDTO(
        String companyName, String npoName, String projectTitle, RelationshipStatus status) {}
