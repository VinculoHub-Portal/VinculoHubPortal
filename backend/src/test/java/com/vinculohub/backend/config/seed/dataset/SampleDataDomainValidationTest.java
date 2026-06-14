/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.vinculohub.backend.model.enums.NpoReportStatus;
import java.util.List;
import org.junit.jupiter.api.Test;

class SampleDataDomainValidationTest {

    private final SampleDataDatasetValidator validator = TestSeedRows.validator();
    private final SeedRowSource source = new SeedRowSource("seed.csv", 2);

    @Test
    void acceptsNpoWithBothValidDocuments() {
        NpoSeedRow base = TestSeedRows.npo();
        NpoSeedRow withBoth =
                new NpoSeedRow(
                        base.key(),
                        base.userKey(),
                        base.addressKey(),
                        base.name(),
                        base.description(),
                        base.logoUrl(),
                        base.npoSize(),
                        "12.345.678/0001-95",
                        "529.982.247-25",
                        base.phone(),
                        base.environmental(),
                        base.social(),
                        base.governance());

        assertThatCode(
                        () ->
                                validator.validate(
                                        dataset(withBoth, TestSeedRows.project(), List.of())))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsInvalidDocument() {
        NpoSeedRow base = TestSeedRows.npo();
        NpoSeedRow invalid =
                new NpoSeedRow(
                        base.key(),
                        base.userKey(),
                        base.addressKey(),
                        base.name(),
                        base.description(),
                        base.logoUrl(),
                        base.npoSize(),
                        null,
                        "111.111.111-11",
                        base.phone(),
                        true,
                        false,
                        false);

        assertThatThrownBy(
                        () ->
                                validator.validate(
                                        dataset(invalid, TestSeedRows.project(), List.of())))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("[cpf]")
                .hasMessageContaining("invalid");
    }

    @Test
    void rejectsNpoWithoutEsgSelection() {
        NpoSeedRow base = TestSeedRows.npo();
        NpoSeedRow noEsg =
                new NpoSeedRow(
                        base.key(),
                        base.userKey(),
                        base.addressKey(),
                        base.name(),
                        base.description(),
                        base.logoUrl(),
                        base.npoSize(),
                        base.cnpj(),
                        base.cpf(),
                        base.phone(),
                        false,
                        false,
                        false);

        assertThatThrownBy(
                        () -> validator.validate(dataset(noEsg, TestSeedRows.project(), List.of())))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("environmental/social/governance");
    }

    @Test
    void rejectsProjectWithoutOds() {
        SampleDataDataset complete = dataset(TestSeedRows.npo(), TestSeedRows.project(), List.of());
        SampleDataDataset dataset =
                new SampleDataDataset(
                        complete.users(),
                        complete.addresses(),
                        complete.companies(),
                        complete.npos(),
                        complete.projects(),
                        List.of(),
                        complete.companyProjects(),
                        complete.npoReports());

        assertThatThrownBy(() -> validator.validate(dataset))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("project_ods.csv");
    }

    @Test
    void rejectsShortReportReason() {
        SeedRow<NpoReportSeedRow> report =
                new SeedRow<>(
                        source,
                        new NpoReportSeedRow(
                                "report", "npo", "company", "short", NpoReportStatus.OPEN));

        assertThatThrownBy(
                        () ->
                                validator.validate(
                                        dataset(
                                                TestSeedRows.npo(),
                                                TestSeedRows.project(),
                                                List.of(report))))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("[reason]");
    }

    private SampleDataDataset dataset(
            NpoSeedRow npo, ProjectSeedRow project, List<SeedRow<NpoReportSeedRow>> reports) {
        return new SampleDataDataset(
                List.of(
                        new SeedRow<>(source, TestSeedRows.companyUser()),
                        new SeedRow<>(source, TestSeedRows.npoUser())),
                List.of(),
                List.of(new SeedRow<>(source, TestSeedRows.company())),
                List.of(new SeedRow<>(source, npo)),
                List.of(new SeedRow<>(source, project)),
                List.of(new SeedRow<>(source, new ProjectOdsSeedRow("project", 1))),
                List.of(),
                reports);
    }
}
