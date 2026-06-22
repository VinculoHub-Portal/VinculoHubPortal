/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AdminRelationshipResponse;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRelationshipService {

    private final CompanyProjectRepository companyProjectRepository;

    @Transactional(readOnly = true)
    public Page<AdminRelationshipResponse> listRelationships(
            String companyName,
            String npoName,
            String projectTitle,
            RelationshipStatus status,
            Pageable pageable) {
        String normalizedCompanyName = companyName != null ? companyName.trim().toLowerCase() : null;
        String normalizedNpoName = npoName != null ? npoName.trim().toLowerCase() : null;
        String normalizedProjectTitle = projectTitle != null ? projectTitle.trim().toLowerCase() : null;
        if (normalizedCompanyName != null && normalizedCompanyName.isEmpty()) normalizedCompanyName = null;
        if (normalizedNpoName != null && normalizedNpoName.isEmpty()) normalizedNpoName = null;
        if (normalizedProjectTitle != null && normalizedProjectTitle.isEmpty()) normalizedProjectTitle = null;
        Page<CompanyProject> page =
                companyProjectRepository.findAdminRelationships(
                        normalizedCompanyName,
                        normalizedNpoName,
                        normalizedProjectTitle,
                        status,
                        pageable);
        return page.map(this::toResponse);
    }

    private AdminRelationshipResponse toResponse(CompanyProject relationship) {
        Company company = relationship.getCompany();
        User companyUser = company.getUser();
        Npo npo = relationship.getProject().getNpo();
        User npoUser = npo.getNpoUser();

        return new AdminRelationshipResponse(
                company.getId(),
                companyDisplayName(company),
                companyUser != null ? companyUser.getEmail() : null,
                npo.getId(),
                npo.getName(),
                npoUser != null ? npoUser.getEmail() : null,
                relationship.getProject().getId(),
                relationship.getProject().getTitle(),
                relationship.getStatus(),
                relationship.getInitiatorType(),
                relationship.getCreatedAt(),
                relationship.getUpdatedAt(),
                relationship.getRespondedAt(),
                relationship.getCompanyConfirmedAt(),
                relationship.getNpoConfirmedAt());
    }

    private String companyDisplayName(Company company) {
        if (company.getSocialName() != null && !company.getSocialName().isBlank()) {
            return company.getSocialName();
        }
        return company.getLegalName();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
