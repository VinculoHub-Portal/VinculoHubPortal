/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.repository.ProjectRepository;
import org.springframework.stereotype.Service;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OdsMapper odsMapper;

    public ProjectService(ProjectRepository projectRepository, OdsMapper odsMapper) {
        this.projectRepository = projectRepository;
        this.odsMapper = odsMapper;
    }

    public Project save(Project project) {
        if (project == null) {
            throw new IllegalArgumentException("O projeto não pode ser nulo.");
        }
        return projectRepository.save(project);
    }

    public Project createFirstProject(Npo npo, NpoFirstProjectSignupRequest request) {
        if (npo == null) {
            throw new IllegalArgumentException("A ONG vinculada ao projeto é obrigatória.");
        }

        if (request == null) {
            throw new IllegalArgumentException("Os dados do primeiro projeto são obrigatórios.");
        }

        Project project =
                Project.builder()
                        .npo(npo)
                        .title(requireText(request.name(), "Nome do projeto é obrigatório."))
                        .description(
                                requireText(
                                        request.description(),
                                        "Descrição do projeto é obrigatória."))
                        .budgetNeeded(request.capital())
                        .odsCodes(odsMapper.normalizeCodes(request.ods()))
                        .build();

        return save(project);
    }

    private static String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
