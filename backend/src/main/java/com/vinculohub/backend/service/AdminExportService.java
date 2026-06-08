/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.VinculoExportDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminExportService {

    private final CompanyProjectRepository companyProjectRepository;

    @Transactional(readOnly = true)
    public List<VinculoExportDTO> findAllVinculosForExport() {
        return companyProjectRepository.findAllForExport().stream()
                .map(this::toExportDTO)
                .toList();
    }

    private VinculoExportDTO toExportDTO(CompanyProject companyProject) {
        Company company = companyProject.getCompany();
        return VinculoExportDTO.builder()
                .companyName(resolveCompanyName(company))
                .npoName(companyProject.getProject().getNpo().getName())
                .projectTitle(companyProject.getProject().getTitle())
                .status(companyProject.getStatus())
                .build();
    }

    private String resolveCompanyName(Company company) {
        String socialName = company.getSocialName();
        if (socialName != null && !socialName.isBlank()) {
            return socialName;
        }
        return company.getLegalName();
    }
}
