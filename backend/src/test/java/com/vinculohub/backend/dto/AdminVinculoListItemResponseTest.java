/* (C)2026 */
package com.vinculohub.backend.dto;

import static org.junit.jupiter.api.Assertions.*;

import com.vinculohub.backend.model.*;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class AdminVinculoListItemResponseTest {

    @Test
    @DisplayName("Deve construir AdminVinculoListItemResponse a partir de CompanyProject")
    void shouldBuildFromCompanyProject() {
        Company company = new Company();
        company.setId(1);
        company.setLegalName("Empresa Alfa LTDA");

        Npo npo = new Npo();
        npo.setId(2);
        npo.setName("ONG Beta");

        Project project = new Project();
        project.setId(10L);
        project.setTitle("Projeto Educação");
        project.setNpo(npo);

        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 15, 10, 0);

        CompanyProject cp =
                CompanyProject.builder()
                        .company(company)
                        .project(project)
                        .status(RelationshipStatus.active)
                        .createdAt(createdAt)
                        .build();

        AdminVinculoListItemResponse resp = AdminVinculoListItemResponse.from(cp);

        assertEquals(1, resp.companyId());
        assertEquals("Empresa Alfa LTDA", resp.companyName());
        assertEquals(10L, resp.projectId());
        assertEquals("Projeto Educação", resp.projectTitle());
        assertEquals(2, resp.npoId());
        assertEquals("ONG Beta", resp.npoName());
        assertEquals(RelationshipStatus.active, resp.status());
        assertEquals(createdAt, resp.createdAt());
    }
}
