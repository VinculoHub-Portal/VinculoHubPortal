/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanySupportedProjectsSummaryResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.repository.projection.CompanySupportedProjectsSummaryProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyPortfolioService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyProjectRepository companyProjectRepository;

    @Transactional(readOnly = true)
    public CompanySupportedProjectsSummaryResponse getSupportedProjectsSummary(String auth0Id) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        Company company =
                companyRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada"));

        CompanySupportedProjectsSummaryProjection summary =
                companyProjectRepository.getSupportedProjectsSummaryByCompanyId(company.getId());

        return toResponse(summary);
    }

    private CompanySupportedProjectsSummaryResponse toResponse(
            CompanySupportedProjectsSummaryProjection summary) {
        if (summary == null) {
            return new CompanySupportedProjectsSummaryResponse(0L, 0L, 0L);
        }

        return new CompanySupportedProjectsSummaryResponse(
                valueOrZero(summary.getTotalActiveProjects()),
                valueOrZero(summary.getIncentiveLawProjects()),
                valueOrZero(summary.getPrivateInvestmentProjects()));
    }

    private Long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }
}
