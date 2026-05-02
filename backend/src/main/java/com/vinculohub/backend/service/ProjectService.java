/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NewProjectRequest;
import com.vinculohub.backend.dto.NewProjectResponse;
import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectType;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.repository.specification.ProjectSpecification;
import java.math.BigDecimal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final OdsService odsService;
    private final UserRepository userRepository;
    private final NpoRepository npoRepository;

    public ProjectService(
            ProjectRepository projectRepository,
            OdsService odsService,
            UserRepository userRepository,
            NpoRepository npoRepository) {
        this.projectRepository = projectRepository;
        this.odsService = odsService;
        this.userRepository = userRepository;
        this.npoRepository = npoRepository;
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
                        .ods(odsService.resolveSelection(request.ods()))
                        .build();

        return save(project);
    }

    @Transactional
    public NewProjectResponse createNewProjectForAuthenticatedNpo(
            String auth0Id, NewProjectRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Os dados do projeto são obrigatórios.");
        }

        User user =
                userRepository
                        .findByAuth0Id(requireText(auth0Id, "Identidade Auth0 é obrigatória."))
                        .orElseThrow(
                                () -> new NotFoundException("Usuário autenticado não encontrado."));

        if (user.getUserType() != UserType.npo) {
            throw new IllegalArgumentException("Apenas ONGs podem criar projetos.");
        }

        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(
                                () -> new NotFoundException("ONG autenticada não encontrada."));

        ProjectType type = requireProjectType(request.type());
        BigDecimal capital = normalizeCapital(type, request.capital());

        Project project =
                Project.builder()
                        .npo(npo)
                        .title(requireText(request.name(), "Nome do projeto é obrigatório."))
                        .description(
                                requireText(
                                        request.description(),
                                        "Descrição do projeto é obrigatória."))
                        .type(type)
                        .budgetNeeded(capital)
                        .ods(odsService.resolveSelection(request.ods()))
                        .build();

        Project savedProject = save(project);
        return new NewProjectResponse(
                savedProject.getId(),
                savedProject.getTitle(),
                savedProject.getDescription(),
                savedProject.getType(),
                savedProject.getBudgetNeeded(),
                savedProject.getNpo().getId());
    }

    @Transactional(readOnly = true)
    public Page<ProjectListItemDTO> listProjects(ProjectFilterParams params, Pageable pageable) {
        Specification<Project> spec = ProjectSpecification.from(params);
        return projectRepository.findAll(spec, pageable).map(ProjectListItemDTO::from);
    }

    private static ProjectType requireProjectType(ProjectType type) {
        if (type == null) {
            throw new IllegalArgumentException("Tipo do projeto é obrigatório.");
        }
        return type;
    }

    private static BigDecimal normalizeCapital(ProjectType type, BigDecimal capital) {
        if (type == ProjectType.SOCIAL_INVESTMENT_LAW) {
            return null;
        }

        if (capital == null) {
            throw new IllegalArgumentException("Meta de captação é obrigatória.");
        }

        if (capital.signum() < 0) {
            throw new IllegalArgumentException("Meta de captação inválida.");
        }

        return capital;
    }

    private static String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
