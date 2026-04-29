/* (C)2026 */
package com.vinculohub.backend.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
class ProjectRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private NpoRepository npoRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void cleanup() {
        projectRepository.deleteAll();
        npoRepository.deleteAll();
    }

    @Test
    @DisplayName("Deve persistir projeto vinculado a uma ONG")
    void shouldPersistProjectWithNpoRelationship() {
        Npo npo = npoRepository.save(
            Npo.builder()
                .name("ONG Exemplo")
                .npoSize(NpoSize.small)
                .environmental(true)
                .build()
        );

        Project project = projectRepository.save(
            Project.builder()
                .npo(npo)
                .title("Projeto Exemplo")
                .description("Projeto piloto para validar o mapeamento.")
                .build()
        );

        assertNotNull(project.getId());
        assertEquals(ProjectStatus.ACTIVE, project.getStatus());

        List<Project> projects = projectRepository.findAllByNpoId(
            Long.valueOf(npo.getId())
        );

        assertEquals(1, projects.size());
        assertEquals(npo.getId(), projects.get(0).getNpo().getId());
        assertEquals("Projeto Exemplo", projects.get(0).getTitle());
    }

    @Test
    @DisplayName("Deve filtrar projetos por status ACTIVE via Specification")
    void shouldFilterByStatusSpecification() {
        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Spec Teste")
                                .npoSize(NpoSize.small)
                                .environmental(true)
                                .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Ativo")
                        .description("D")
                        .status(ProjectStatus.ACTIVE)
                        .build());
        projectRepository.save(
                Project.builder()
                        .npo(npo)
                        .title("Cancelado")
                        .description("D")
                        .status(ProjectStatus.CANCELLED)
                        .build());

        Specification<Project> spec =
                ProjectSpecification.from(new ProjectFilterParams(null, ProjectStatus.ACTIVE, null));
        Page<Project> result = projectRepository.findAll(spec, PageRequest.of(0, 20));

        assertEquals(1, result.getTotalElements());
        assertEquals(ProjectStatus.ACTIVE, result.getContent().get(0).getStatus());
    }

    @Test
    @DisplayName("Deve filtrar projetos por título parcial case-insensitive via Specification")
    void shouldFilterByTitleSpecification() {
        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Spec Title")
                                .npoSize(NpoSize.small)
                                .environmental(false)
                                .build());
        projectRepository.save(
                Project.builder().npo(npo).title("Biblioteca Central").description("D").build());
        projectRepository.save(
                Project.builder().npo(npo).title("Horta Comunitária").description("D").build());

        Specification<Project> spec =
                ProjectSpecification.from(new ProjectFilterParams(null, null, "BIBLIO"));
        Page<Project> result = projectRepository.findAll(spec, PageRequest.of(0, 20));

        assertEquals(1, result.getTotalElements());
        assertEquals("Biblioteca Central", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("Deve retornar página vazia quando nenhum projeto corresponde ao filtro")
    void shouldReturnEmptyPageWhenNoMatch() {
        Specification<Project> spec =
                ProjectSpecification.from(
                        new ProjectFilterParams(null, null, "titulo-que-nao-existe"));
        Page<Project> result = projectRepository.findAll(spec, PageRequest.of(0, 20));

        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }
}
