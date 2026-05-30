/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NpoReportCreateRequest;
import com.vinculohub.backend.dto.NpoReportResponse;
import com.vinculohub.backend.dto.NpoReportStatusUpdateRequest;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.NpoReport;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NpoReportService {

    private final NpoReportRepository npoReportRepository;
    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @Transactional
    public NpoReportResponse createReport(
            Integer npoId, String reporterAuth0Id, NpoReportCreateRequest request) {
        User reporterUser =
                userRepository
                        .findByAuth0Id(reporterAuth0Id)
                        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
        Company reporterCompany =
                companyRepository
                        .findByUserId(reporterUser.getId())
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada."));
        Npo reportedNpo =
                npoRepository
                        .findById(npoId)
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada."));

        NpoReport report =
                NpoReport.builder()
                        .npo(reportedNpo)
                        .reporterCompany(reporterCompany)
                        .reporterUser(reporterUser)
                        .reason(request.reason().trim())
                        .build();

        return NpoReportResponse.from(npoReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<NpoReportResponse> listReportsForAdmin() {
        return npoReportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(NpoReportResponse::from)
                .toList();
    }

    @Transactional
    public NpoReportResponse updateReportStatus(
            Long reportId, NpoReportStatusUpdateRequest request) {
        NpoReport report =
                npoReportRepository
                        .findById(reportId)
                        .orElseThrow(() -> new NotFoundException("Denúncia não encontrada."));

        report.setStatus(request.status());
        return NpoReportResponse.from(npoReportRepository.save(report));
    }
}
