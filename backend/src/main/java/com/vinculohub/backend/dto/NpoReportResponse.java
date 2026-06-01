/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.NpoReport;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import java.time.LocalDateTime;

public record NpoReportResponse(
        Long id,
        ReportedNpo npo,
        ReporterCompany reporterCompany,
        ReporterUser reporterUser,
        String reason,
        NpoReportStatus status,
        LocalDateTime createdAt) {

    public static NpoReportResponse from(NpoReport report) {
        return new NpoReportResponse(
                report.getId(),
                ReportedNpo.from(report.getNpo()),
                ReporterCompany.from(report.getReporterCompany()),
                ReporterUser.from(report.getReporterUser()),
                report.getReason(),
                report.getStatus(),
                report.getCreatedAt());
    }

    public record ReportedNpo(Integer id, String name, String email) {
        static ReportedNpo from(Npo npo) {
            String email =
                    npo.getNpoUser() != null ? npo.getNpoUser().getEmail() : null;
            return new ReportedNpo(npo.getId(), npo.getName(), email);
        }
    }

    public record ReporterCompany(Integer id, String name, String cnpj) {
        static ReporterCompany from(Company company) {
            String name =
                    company.getSocialName() != null && !company.getSocialName().isBlank()
                            ? company.getSocialName()
                            : company.getLegalName();
            return new ReporterCompany(company.getId(), name, company.getCnpj());
        }
    }

    public record ReporterUser(Integer id, String name, String email) {
        static ReporterUser from(User user) {
            return new ReporterUser(user.getId(), user.getName(), user.getEmail());
        }
    }
}
