/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class SampleDataRelationshipValidatorTest {

    private final SampleDataDatasetValidator validator = TestSeedRows.validator();
    private final SeedRowSource source = new SeedRowSource("company_projects.csv", 2);

    @Test
    void acceptsConsistentRelationshipLifecycleStates() {
        assertThatCode(
                        () ->
                                validator.validate(
                                        dataset(
                                                List.of(
                                                        relationship(
                                                                RelationshipStatus.active,
                                                                time(2),
                                                                time(3),
                                                                time(1))))))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsActiveRelationshipWithoutBilateralConfirmation() {
        assertThatThrownBy(
                        () ->
                                validator.validate(
                                        dataset(
                                                List.of(
                                                        relationship(
                                                                RelationshipStatus.active,
                                                                time(2),
                                                                null,
                                                                time(1))))))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("active relationship")
                .hasMessageContaining("confirmed by both sides");
    }

    @Test
    void rejectsDuplicateCompanyProjectPair() {
        SeedRow<CompanyProjectSeedRow> relationship =
                relationship(RelationshipStatus.pending, null, null, null);

        assertThatThrownBy(() -> validator.validate(dataset(List.of(relationship, relationship))))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("duplicates company and project pair");
    }

    private SampleDataDataset dataset(List<SeedRow<CompanyProjectSeedRow>> relationships) {
        return new SampleDataDataset(
                List.of(
                        new SeedRow<>(source, TestSeedRows.companyUser()),
                        new SeedRow<>(source, TestSeedRows.npoUser())),
                List.of(),
                List.of(new SeedRow<>(source, TestSeedRows.company())),
                List.of(new SeedRow<>(source, TestSeedRows.npo())),
                List.of(new SeedRow<>(source, TestSeedRows.project())),
                List.of(new SeedRow<>(source, new ProjectOdsSeedRow("project", 1))),
                relationships,
                List.of());
    }

    private SeedRow<CompanyProjectSeedRow> relationship(
            RelationshipStatus status,
            LocalDateTime companyConfirmedAt,
            LocalDateTime npoConfirmedAt,
            LocalDateTime respondedAt) {
        return new SeedRow<>(
                source,
                new CompanyProjectSeedRow(
                        "company",
                        "project",
                        status,
                        InitiatorType.company,
                        companyConfirmedAt,
                        npoConfirmedAt,
                        respondedAt,
                        null));
    }

    private LocalDateTime time(int day) {
        return LocalDateTime.of(2026, 1, day, 10, 0);
    }
}
