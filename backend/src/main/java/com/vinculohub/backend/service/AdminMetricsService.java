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

    private final NpoRepository npoRepository;
    private final EditalRepository editalRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final NpoReportRepository npoReportRepository;

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        long totalNpos = npoRepository.count();
        long publishedEditais = editalRepository.countActive(LocalDateTime.now());
        long activeVinculos = companyProjectRepository.countByStatus(RelationshipStatus.active);
        long pendingNotifications = npoReportRepository.countByStatus(NpoReportStatus.OPEN);

        return new AdminMetricsResponse(
                totalNpos, publishedEditais, activeVinculos, pendingNotifications);
    }
}
