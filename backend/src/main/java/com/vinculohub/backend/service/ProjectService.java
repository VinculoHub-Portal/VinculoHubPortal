/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyEsgImpactDashboardResponse;
import com.vinculohub.backend.dto.EsgPillarImpactDTO;
import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.dto.ProjectCreateRequest;
import com.vinculohub.backend.dto.ProjectCreateResponse;
import com.vinculohub.backend.dto.ProjectFilterParams;
import com.vinculohub.backend.dto.ProjectListItemDTO;
import com.vinculohub.backend.dto.ProjectUpdateRequest;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.EsgPillar;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.repository.projection.EsgPillarAggregationProjection;
import com.vinculohub.backend.repository.projection.PortfolioTotalsProjection;
import com.vinculohub.backend.repository.specification.ProjectSpecification;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final OdsService odsService;

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
                        .type(request.type())
                        .ods(odsService.resolveSelection(request.ods()))
                        .build();

        return save(project);
    }

    @Transactional
    public Project updateProject(String auth0Id, Long projectId, ProjectUpdateRequest request) {
        if (auth0Id == null || auth0Id.isBlank()) {
            log.error("Usuário autenticado não identificado");
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }

        if (request == null) {
            throw new BadRequestException("Dados do projeto são obrigatórios.");
        }

        log.info("Updating project | projectId={} auth0Id={}", projectId, auth0Id);

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Npo npo =
                npoRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("ONG não encontrada"));

        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));

        if (!project.getNpo().getId().equals(npo.getId())) {
            log.warn(
                    "Access denied: ONG {} tried to update project {} of ONG {}",
                    npo.getId(),
                    projectId,
                    project.getNpo().getId());
            throw new ForbiddenException("Você não tem permissão para atualizar este projeto.");
        }

        Set<Ods> ods;
        try {
            List<String> odsIds =
                    request.odsIds() == null
                            ? null
                            : request.odsIds().stream()
                                    .map(odsId -> String.valueOf(odsId))
                                    .toList();
            ods = odsService.resolveSelection(odsIds);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("ODS inválido");
        }

        project.setTitle(request.title());
        project.setDescription(request.description());
        project.setBudgetNeeded(request.budgetNeeded());
        project.setType(request.type());
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setOds(ods);
        project.setFocusArea(request.focusArea());
        project.setFundraisingDeadline(request.fundraisingDeadline());
        project.setBeneficiariesCount(request.beneficiariesCount());
        project.setLocation(request.location());
        project.setMainObjective(request.mainObjective());

        Project updated = projectRepository.save(project);
        log.info("Project updated | id={} npoId={}", updated.getId(), npo.getId());

        return updated;
    }

    @Transactional
    public ProjectCreateResponse createProject(String auth0Id, ProjectCreateRequest request) {
        if (auth0Id == null || auth0Id.isBlank()) {
            log.error("Usuário autenticado não identificado");
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
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

        Set<Ods> ods;
        try {
            List<String> odsIds =
                    request.odsIds() == null
                            ? null
                            : request.odsIds().stream()
                                    .map(odsId -> String.valueOf(odsId))
                                    .toList();
            ods = odsService.resolveSelection(odsIds);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("ODS inválido");
        }

        Project project =
                Project.builder()
                        .npo(npo)
                        .title(request.title())
                        .description(request.description())
                        .budgetNeeded(request.budgetNeeded())
                        .investedAmount(BigDecimal.ZERO)
                        .status(ProjectStatus.ACTIVE)
                        .type(request.type())
                        .startDate(request.startDate())
                        .endDate(request.endDate())
                        .ods(ods)
                        .focusArea(request.focusArea())
                        .fundraisingDeadline(request.fundraisingDeadline())
                        .beneficiariesCount(request.beneficiariesCount())
                        .location(request.location())
                        .mainObjective(request.mainObjective())
                        .build();

        Project saved = projectRepository.save(project);
        log.info("Project persisted | id={} npoId={}", saved.getId(), npo.getId());

        return toCreateResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProjectListItemDTO> listProjects(ProjectFilterParams params, Pageable pageable) {
        Specification<Project> spec = ProjectSpecification.from(params);
        return projectRepository.findAll(spec, pageable).map(ProjectListItemDTO::from);
    }

    @Transactional(readOnly = true)
    public Project findById(Long id) {
        return projectRepository
                .findById(id)
                .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));
    }

    @Transactional(readOnly = true)
    public CompanyEsgImpactDashboardResponse getEsgImpactDashboard(String auth0Id) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);
        Company company =
                companyRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada"));

        PortfolioTotalsProjection totals =
                projectRepository.sumPortfolioTotalsByCompanyId(company.getId());
        BigDecimal totalInvested =
                totals == null ? BigDecimal.ZERO : zeroIfNull(totals.getTotalInvested());
        BigDecimal totalBudgetNeeded =
                totals == null ? BigDecimal.ZERO : zeroIfNull(totals.getTotalBudgetNeeded());
        long projectCount =
                totals == null || totals.getProjectCount() == null ? 0L : totals.getProjectCount();

        Map<EsgPillar, EsgPillarAggregationProjection> byPillar =
                projectRepository.sumByEsgPillarForCompany(company.getId()).stream()
                        .collect(
                                Collectors.toMap(
                                        row -> EsgPillar.valueOf(row.getPillar()),
                                        Function.identity()));

        List<EsgPillarImpactDTO> pillars =
                Arrays.stream(EsgPillar.values())
                        .map(
                                pillar -> {
                                    EsgPillarAggregationProjection row = byPillar.get(pillar);
                                    BigDecimal pillarInvested =
                                            row == null
                                                    ? BigDecimal.ZERO
                                                    : zeroIfNull(row.getTotalInvested());
                                    BigDecimal pillarBudget =
                                            row == null
                                                    ? BigDecimal.ZERO
                                                    : zeroIfNull(row.getTotalBudgetNeeded());
                                    long pillarProjects =
                                            row == null || row.getProjectCount() == null
                                                    ? 0L
                                                    : row.getProjectCount();

                                    return new EsgPillarImpactDTO(
                                            pillar,
                                            pillar.getLabel(),
                                            pillarProjects,
                                            pillarInvested,
                                            pillarBudget,
                                            investmentPercentage(pillarInvested, totalInvested));
                                })
                        .toList();

        return new CompanyEsgImpactDashboardResponse(
                projectCount, totalInvested, totalBudgetNeeded, pillars);
    }

    private static BigDecimal zeroIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static BigDecimal investmentPercentage(
            BigDecimal pillarInvested, BigDecimal totalInvested) {
        if (totalInvested.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return pillarInvested
                .multiply(BigDecimal.valueOf(100))
                .divide(totalInvested, 2, RoundingMode.HALF_UP);
    }

    private static String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    @Transactional
    public void deleteProject(String auth0Id, Long projectId) {
        Project project =
                projectRepository
                        .findById(projectId)
                        .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));

        Integer projectOwner = project.getNpo().getUserId();

        User userRequested =
                userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        if (!userRequested.getId().equals(projectOwner)) {
            throw new ForbiddenException("Você não tem permissão para deletar este projeto.");
        } else {
            project.setDeletedAt(LocalDateTime.now());
            projectRepository.save(project);
        }
    }

    private ProjectCreateResponse toCreateResponse(Project project) {
        Set<Ods> ods = project.getOds() == null ? Set.of() : project.getOds();
        List<OdsResponse> odsResponses =
                ods.stream()
                        .map(
                                item ->
                                        new OdsResponse(
                                                item.getId(),
                                                item.getName(),
                                                item.getDescription()))
                        .toList();

        return ProjectCreateResponse.builder()
                .id(project.getId())
                .npoId(project.getNpo().getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .status(project.getStatus())
                .type(project.getType())
                .budgetNeeded(project.getBudgetNeeded())
                .investedAmount(project.getInvestedAmount())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .ods(odsResponses)
                .focusArea(project.getFocusArea())
                .fundraisingDeadline(project.getFundraisingDeadline())
                .beneficiariesCount(project.getBeneficiariesCount())
                .location(project.getLocation())
                .mainObjective(project.getMainObjective())
                .build();
    }
}
