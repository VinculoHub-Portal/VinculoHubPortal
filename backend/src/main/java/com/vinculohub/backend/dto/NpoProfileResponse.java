/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record NpoProfileResponse(
        ViewerContext viewerContext,
        InstitutionalData institutionalData,
        ContactData contact,
        AddressData address,
        ResponsibleData responsible,
        List<ProjectData> projects,
        List<DocumentData> documents) {

    public enum ViewerContext {
        OWNER,
        EXTERNAL
    }

    public record InstitutionalData(
            Integer id,
            String name,
            String description,
            String logoUrl,
            NpoSize npoSize,
            String cnpj,
            String cpf,
            Boolean environmental,
            Boolean social,
            Boolean governance) {}

    public record ContactData(String email, String phone) {}

    public record AddressData(
            Integer id,
            String state,
            String stateCode,
            String city,
            String street,
            String number,
            String complement,
            String zipCode) {}

    public record ResponsibleData(
            Integer id, String name, String email, String auth0Id, UserType userType) {}

    public record ProjectData(
            Long id,
            String title,
            String description,
            ProjectStatus status,
            ProjectType type,
            BigDecimal budgetNeeded,
            BigDecimal investedAmount,
            LocalDate startDate,
            LocalDate endDate,
            String focusArea,
            String fundraisingDeadline,
            Integer beneficiariesCount,
            String location,
            String mainObjective) {}

    public record DocumentData(
            Integer id,
            String title,
            String description,
            String fileUrl,
            String fileName,
            Integer fileSize,
            String mimeType,
            LocalDateTime createdAt,
            Long projectId) {}
}
