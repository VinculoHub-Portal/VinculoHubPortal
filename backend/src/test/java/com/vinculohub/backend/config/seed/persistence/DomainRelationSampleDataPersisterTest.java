/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import com.vinculohub.backend.config.seed.dataset.CompanyProjectSeedRow;
import com.vinculohub.backend.config.seed.dataset.NpoReportSeedRow;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.dataset.SeedRowSource;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.NpoReport;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.NpoReportStatus;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.NpoReportRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class DomainRelationSampleDataPersisterTest {

    @Test
    void persistsRelationshipLifecycleAndNpoReportReferences() {
        CompanyProjectRepository relationships = mock(CompanyProjectRepository.class);
        NpoReportRepository reports = mock(NpoReportRepository.class);
        Company company = new Company();
        company.setId(10);
        Project project = Project.builder().id(20L).build();
        Npo npo = Npo.builder().id(30).build();
        User reporter = User.builder().id(40).build();
        PersistedSampleData persisted =
                new PersistedSampleData(
                        Map.of("reporter", reporter),
                        Map.of(),
                        Map.of("company", company),
                        Map.of("npo", npo),
                        Map.of("project", project));
        LocalDateTime respondedAt = LocalDateTime.of(2026, 1, 2, 10, 0);
        LocalDateTime companyConfirmedAt = LocalDateTime.of(2026, 1, 3, 10, 0);

        new DomainRelationSampleDataPersister(relationships, reports)
                .persist(dataset(respondedAt, companyConfirmedAt), persisted);

        ArgumentCaptor<CompanyProject> relationshipCaptor =
                ArgumentCaptor.forClass(CompanyProject.class);
        verify(relationships).save(relationshipCaptor.capture());
        CompanyProject relationship = relationshipCaptor.getValue();
        assertThat(relationship.getId().getCompanyId()).isEqualTo(10);
        assertThat(relationship.getId().getProjectId()).isEqualTo(20L);
        assertThat(relationship.getStatus()).isEqualTo(RelationshipStatus.negotiation);
        assertThat(relationship.getInitiatorType()).isEqualTo(InitiatorType.company);
        assertThat(relationship.getRespondedAt()).isEqualTo(respondedAt);
        assertThat(relationship.getCompanyConfirmedAt()).isEqualTo(companyConfirmedAt);

        ArgumentCaptor<NpoReport> reportCaptor = ArgumentCaptor.forClass(NpoReport.class);
        verify(reports).save(reportCaptor.capture());
        NpoReport report = reportCaptor.getValue();
        assertThat(report.getNpo()).isSameAs(npo);
        assertThat(report.getReporterCompany()).isSameAs(company);
        assertThat(report.getReporterUser()).isSameAs(reporter);
        assertThat(report.getStatus()).isEqualTo(NpoReportStatus.OPEN);
    }

    private SampleDataDataset dataset(LocalDateTime respondedAt, LocalDateTime companyConfirmedAt) {
        SeedRowSource source = new SeedRowSource("relations.csv", 2);
        return new SampleDataDataset(
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(),
                List.of(
                        new SeedRow<>(
                                source,
                                new CompanyProjectSeedRow(
                                        "company",
                                        "project",
                                        RelationshipStatus.negotiation,
                                        InitiatorType.company,
                                        companyConfirmedAt,
                                        null,
                                        respondedAt,
                                        null))),
                List.of(
                        new SeedRow<>(
                                source,
                                new NpoReportSeedRow(
                                        "report",
                                        "npo",
                                        "company",
                                        "reporter",
                                        "Reason",
                                        NpoReportStatus.OPEN))));
    }
}
