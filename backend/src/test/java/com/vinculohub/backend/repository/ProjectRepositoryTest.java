/* (C)2026 */
package com.vinculohub.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class ProjectRepositoryTest {

    @Autowired private NpoRepository npoRepository;

    @Autowired private ProjectRepository projectRepository;

    @Test
    @DisplayName("Deve persistir projeto vinculado a uma ONG")
    void shouldPersistProjectWithNpoRelationship() {
        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Exemplo")
                                .npoSize(NpoSize.SMALL)
                                .environmental(true)
                                .build());

        Project project =
                projectRepository.save(
                        Project.builder()
                                .npo(npo)
                                .title("Projeto Exemplo")
                                .description("Projeto piloto para validar o mapeamento.")
                                .build());

        assertNotNull(project.getId());
        assertEquals(ProjectStatus.DRAFT, project.getStatus());

        List<Project> projects = projectRepository.findAllByNpoId(npo.getId());

        assertEquals(1, projects.size());
        assertEquals(npo.getId(), projects.get(0).getNpo().getId());
        assertEquals("Projeto Exemplo", projects.get(0).getTitle());
    }
}
