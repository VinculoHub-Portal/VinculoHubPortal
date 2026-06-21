/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AdminMetricsResponse;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.EditalRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import com.vinculohub.backend.repository.NpoRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminMetricsService {

    private static final int OVERDUE_DAYS = 7;

    private final NpoRepository npoRepository;
    private final EditalRepository editalRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final NpoReportRepository npoReportRepository;

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        LocalDateTime now = LocalDateTime.now();
        long totalNpos = npoRepository.count();
        long publishedEditais = editalRepository.countActive(now);
        long activeVinculos = companyProjectRepository.countByStatus(RelationshipStatus.active);
        long openReports = npoReportRepository.countByStatus(NpoReportStatus.OPEN);
        long overdueRelationships =
                companyProjectRepository.countByStatusAndCreatedAtLessThanEqual(
                        RelationshipStatus.pending, now.minusDays(OVERDUE_DAYS));
        long pendingNotifications = openReports + overdueRelationships;

        return new AdminMetricsResponse(
                totalNpos, publishedEditais, activeVinculos, pendingNotifications);
    }
}
