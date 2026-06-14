/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.service.NpoEsgService;
import jakarta.validation.Validation;

final class TestSeedRows {

    private TestSeedRows() {}

    static UserSeedRow companyUser() {
        return new UserSeedRow(
                "company_user", "Company User", "company@example.test", UserType.company);
    }

    static UserSeedRow npoUser() {
        return new UserSeedRow("npo_user", "NPO User", "npo@example.test", UserType.npo);
    }

    static CompanySeedRow company() {
        return new CompanySeedRow(
                "company",
                "company_user",
                null,
                "Company Legal Name",
                "Company",
                null,
                null,
                "11.222.333/0001-81",
                null);
    }

    static NpoSeedRow npo() {
        return new NpoSeedRow(
                "npo",
                "npo_user",
                null,
                "NPO",
                null,
                null,
                NpoSize.small,
                null,
                "529.982.247-25",
                null,
                true,
                false,
                false);
    }

    static ProjectSeedRow project() {
        return new ProjectSeedRow(
                "project",
                "npo",
                "Project",
                "Project description with enough detail for the normal application validation.",
                ProjectStatus.ACTIVE,
                ProjectType.SOCIAL,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                0);
    }

    static SampleDataDatasetValidator validator() {
        return new SampleDataDatasetValidator(
                new NpoEsgService(), Validation.buildDefaultValidatorFactory().getValidator());
    }
}
