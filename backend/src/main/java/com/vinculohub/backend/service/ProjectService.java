/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.Sdg;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.SdgRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final OdsMapper odsMapper;
    private final SdgRepository sdgRepository;
    private final NpoRepository npoRepository;
    private final UserRepository userRepository;

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

    @Transactional
    public ProjectCreateResponse createProject(String auth0Id, ProjectCreateRequest request) {
        if (auth0Id == null || auth0Id.isBlank()) {
            log.error("Auth0 ID is blank");
            throw new BadRequestException("Auth0 ID é obrigatório.");
        }

        if (request == null) {
            throw new BadRequestException("Dados do projeto são obrigatórios.");
        }

        log.info("Creating project | auth0Id={} title={}", auth0Id, request.title());

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada"));

        Set<Integer> odsIds = new LinkedHashSet<>(request.odsIds());
        if (odsIds.stream().anyMatch(Objects::isNull)) {
            throw new BadRequestException("ODS inválido");
        }

        List<Sdg> sdgs = sdgRepository.findAllById(odsIds);
        if (sdgs.size() != odsIds.size()) {
            throw new BadRequestException("ODS inválido");
        }

        Project project =
                Project.builder()
                        .npo(npo)
                        .title(request.title())
                        .description(request.description())
                        .budgetNeeded(request.budgetNeeded())
                        .investedAmount(BigDecimal.ZERO)
                        .status(ProjectStatus.active)
                        .startDate(request.startDate())
                        .endDate(request.endDate())
                        .sdgs(new LinkedHashSet<>(sdgs))
                        .build();

        Project saved = projectRepository.save(project);
        log.info("Project persisted | id={} npoId={}", saved.getId(), npo.getId());

        return toCreateResponse(saved, odsIds);
    }

    private static String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private ProjectCreateResponse toCreateResponse(Project project, Set<Integer> requestedOdsIds) {
        Map<Integer, Sdg> sdgsById =
                project.getSdgs().stream()
                        .collect(Collectors.toMap(Sdg::getId, Function.identity()));
        List<OdsResponse> odsResponses =
                requestedOdsIds.stream()
                        .map(sdgsById::get)
                        .filter(Objects::nonNull)
                        .map(sdg -> new OdsResponse(sdg.getId(), sdg.getName()))
                        .toList();

        return ProjectCreateResponse.builder()
                .id(project.getId())
                .npoId(project.getNpo().getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .budgetNeeded(project.getBudgetNeeded())
                .investedAmount(project.getInvestedAmount())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ods(odsResponses)
                .createdAt(project.getCreatedAt())
                .build();
    }
}
