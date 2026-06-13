/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.UserType;

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
                "company", "company_user", null, "Company", null, null, null, null, null);
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
                "00.000.000/0001-00",
                null,
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
                "Description",
                ProjectStatus.ACTIVE,
                null,
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
}
