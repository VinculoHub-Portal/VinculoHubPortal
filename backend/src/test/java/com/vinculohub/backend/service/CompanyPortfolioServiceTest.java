/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

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
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CompanyPortfolioServiceTest {

    @Mock private UserRepository userRepository;

    @Mock private CompanyRepository companyRepository;

    @Mock private CompanyProjectRepository companyProjectRepository;

    @Mock private CompanySupportedProjectsSummaryProjection summaryProjection;

    @InjectMocks private CompanyPortfolioService companyPortfolioService;

    @Test
    void shouldReturnSupportedProjectsSummarySuccessfully() {
        String auth0Id = "auth0|company";
        User user = User.builder().id(10).auth0Id(auth0Id).build();
        Company company = new Company();
        company.setId(20);

        when(userRepository.findByAuth0Id(auth0Id)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(10)).thenReturn(Optional.of(company));
        when(companyProjectRepository.getSupportedProjectsSummaryByCompanyId(20))
                .thenReturn(summaryProjection);
        when(summaryProjection.getTotalActiveProjects()).thenReturn(6L);
        when(summaryProjection.getIncentiveLawProjects()).thenReturn(4L);
        when(summaryProjection.getPrivateInvestmentProjects()).thenReturn(2L);

        CompanySupportedProjectsSummaryResponse response =
                companyPortfolioService.getSupportedProjectsSummary(auth0Id);

        assertEquals(6L, response.active());
        assertEquals(4L, response.incentiveLaws());
        assertEquals(2L, response.privateInvestment());

        verify(userRepository).findByAuth0Id(auth0Id);
        verify(companyRepository).findByUserId(10);
        verify(companyProjectRepository).getSupportedProjectsSummaryByCompanyId(20);
    }

    @Test
    void shouldThrowBadRequestExceptionWhenAuth0IdIsBlank() {
        BadRequestException exception =
                assertThrows(
                        BadRequestException.class,
                        () -> companyPortfolioService.getSupportedProjectsSummary(" "));

        assertEquals("Não foi possível identificar o usuário autenticado.", exception.getMessage());
        verifyNoInteractions(userRepository, companyRepository, companyProjectRepository);
    }

    @Test
    void shouldThrowUserNotFoundExceptionWhenUserIsNotFound() {
        when(userRepository.findByAuth0Id("auth0|missing")).thenReturn(Optional.empty());

        assertThrows(
                UserNotFoundException.class,
                () -> companyPortfolioService.getSupportedProjectsSummary("auth0|missing"));

        verify(userRepository).findByAuth0Id("auth0|missing");
        verifyNoInteractions(companyRepository, companyProjectRepository);
    }

    @Test
    void shouldThrowNotFoundExceptionWhenCompanyIsNotFound() {
        User user = User.builder().id(10).auth0Id("auth0|company").build();

        when(userRepository.findByAuth0Id("auth0|company")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(10)).thenReturn(Optional.empty());

        NotFoundException exception =
                assertThrows(
                        NotFoundException.class,
                        () -> companyPortfolioService.getSupportedProjectsSummary("auth0|company"));

        assertEquals("Empresa não encontrada", exception.getMessage());
        verify(userRepository).findByAuth0Id("auth0|company");
        verify(companyRepository).findByUserId(10);
        verifyNoInteractions(companyProjectRepository);
    }

    @Test
    void shouldReturnZerosWhenRepositoryProjectionReturnsNull() {
        String auth0Id = "auth0|company";
        User user = User.builder().id(10).auth0Id(auth0Id).build();
        Company company = new Company();
        company.setId(20);

        when(userRepository.findByAuth0Id(auth0Id)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(10)).thenReturn(Optional.of(company));
        when(companyProjectRepository.getSupportedProjectsSummaryByCompanyId(20)).thenReturn(null);

        CompanySupportedProjectsSummaryResponse response =
                companyPortfolioService.getSupportedProjectsSummary(auth0Id);

        assertEquals(0L, response.active());
        assertEquals(0L, response.incentiveLaws());
        assertEquals(0L, response.privateInvestment());
    }

    @Test
    void shouldReturnZerosForNullProjectionValues() {
        String auth0Id = "auth0|company";
        User user = User.builder().id(10).auth0Id(auth0Id).build();
        Company company = new Company();
        company.setId(20);

        when(userRepository.findByAuth0Id(auth0Id)).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(10)).thenReturn(Optional.of(company));
        when(companyProjectRepository.getSupportedProjectsSummaryByCompanyId(20))
                .thenReturn(summaryProjection);
        when(summaryProjection.getTotalActiveProjects()).thenReturn(null);
        when(summaryProjection.getIncentiveLawProjects()).thenReturn(null);
        when(summaryProjection.getPrivateInvestmentProjects()).thenReturn(null);

        CompanySupportedProjectsSummaryResponse response =
                companyPortfolioService.getSupportedProjectsSummary(auth0Id);

        assertEquals(0L, response.active());
        assertEquals(0L, response.incentiveLaws());
        assertEquals(0L, response.privateInvestment());
    }
}
