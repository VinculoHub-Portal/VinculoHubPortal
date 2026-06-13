/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.dataset.CompanyProjectSeedRow;
import com.vinculohub.backend.config.seed.dataset.NpoReportSeedRow;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.NpoReport;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DomainRelationSampleDataPersister {

    private final CompanyProjectRepository companyProjectRepository;
    private final NpoReportRepository npoReportRepository;

    public void persist(SampleDataDataset dataset, PersistedSampleData persisted) {
        persistCompanyProjects(dataset, persisted);
        persistNpoReports(dataset, persisted);
    }

    private void persistCompanyProjects(SampleDataDataset dataset, PersistedSampleData persisted) {
        for (SeedRow<CompanyProjectSeedRow> seedRow : dataset.companyProjects()) {
            CompanyProjectSeedRow row = seedRow.value();
            Company company = required(persisted.companies(), row.companyKey(), "Company");
            Project project = required(persisted.projects(), row.projectKey(), "Project");
            CompanyProject relationship =
                    CompanyProject.builder()
                            .id(new CompanyProjectId(company.getId(), project.getId()))
                            .company(company)
                            .project(project)
                            .status(row.status())
                            .initiatorType(row.initiatorType())
                            .companyConfirmedAt(row.companyConfirmedAt())
                            .npoConfirmedAt(row.npoConfirmedAt())
                            .respondedAt(row.respondedAt())
                            .expiresAt(row.expiresAt())
                            .build();
            companyProjectRepository.save(relationship);
        }
    }

    private void persistNpoReports(SampleDataDataset dataset, PersistedSampleData persisted) {
        for (SeedRow<NpoReportSeedRow> seedRow : dataset.npoReports()) {
            NpoReportSeedRow row = seedRow.value();
            Npo reportTarget = required(persisted.npos(), row.npoKey(), "NPO");
            Company reporterCompany =
                    required(persisted.companies(), row.reporterCompanyKey(), "Company");
            User reporterUser = required(persisted.users(), row.reporterUserKey(), "User");
            NpoReport report =
                    NpoReport.builder()
                            .npo(reportTarget)
                            .reporterCompany(reporterCompany)
                            .reporterUser(reporterUser)
                            .reason(row.reason())
                            .status(row.status())
                            .build();
            npoReportRepository.save(report);
        }
    }

    private <T> T required(Map<String, T> values, String key, String entityName) {
        T value = values.get(key);
        if (value == null) {
            throw new SampleDataSeedException(
                    "%s was not persisted for logical key '%s'".formatted(entityName, key));
        }
        return value;
    }
}
