/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.AdminMetricsResponse;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import com.vinculohub.backend.repository.NpoRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AdminMetricsServiceTest {

    @Mock private NpoRepository npoRepository;

    @Mock private EditalRepository editalRepository;

    @Mock private CompanyProjectRepository companyProjectRepository;

    @Mock private NpoReportRepository npoReportRepository;

    @InjectMocks private AdminMetricsService adminMetricsService;

    @Test
    void shouldAggregateCountsFromAllRepositories() {
        when(npoRepository.count()).thenReturn(87L);
        when(editalRepository.countActive(any(LocalDateTime.class))).thenReturn(24L);
        when(companyProjectRepository.countByStatus(RelationshipStatus.active)).thenReturn(156L);
        when(npoReportRepository.countByStatus(NpoReportStatus.OPEN)).thenReturn(5L);

        AdminMetricsResponse response = adminMetricsService.getMetrics();

        assertEquals(new AdminMetricsResponse(87L, 24L, 156L, 5L), response);
        verify(npoRepository).count();
        verify(editalRepository).countActive(any(LocalDateTime.class));
        verify(companyProjectRepository).countByStatus(RelationshipStatus.active);
        verify(npoReportRepository).countByStatus(NpoReportStatus.OPEN);
    }

    @Test
    void shouldReturnZeroMetricsWhenRepositoriesAreEmpty() {
        when(npoRepository.count()).thenReturn(0L);
        when(editalRepository.countActive(any(LocalDateTime.class))).thenReturn(0L);
        when(companyProjectRepository.countByStatus(RelationshipStatus.active)).thenReturn(0L);
        when(npoReportRepository.countByStatus(NpoReportStatus.OPEN)).thenReturn(0L);

        AdminMetricsResponse response = adminMetricsService.getMetrics();

        assertEquals(new AdminMetricsResponse(0L, 0L, 0L, 0L), response);
    }
}
