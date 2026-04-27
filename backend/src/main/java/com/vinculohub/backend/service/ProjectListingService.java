/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.ProjectSummaryDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectStatusFilter;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class ProjectListingService {

    private final UserRepository userRepository;
    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;

    public ProjectListingService(
            UserRepository userRepository,
            NpoRepository npoRepository,
            CompanyRepository companyRepository,
            ProjectRepository projectRepository) {
        this.userRepository = userRepository;
        this.npoRepository = npoRepository;
        this.companyRepository = companyRepository;
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummaryDTO> listProjectsForCurrentUser(
            String auth0Id, ProjectStatusFilter filter) {
        Optional<User> userOpt = userRepository.findByAuth0Id(auth0Id);
        if (userOpt.isEmpty()) {
            log.info(
                    "Listagem | usuário auth0Id={} não encontrado, retornando lista vazia",
                    auth0Id);
            return List.of();
        }

        User user = userOpt.get();
        Optional<ProjectStatus> statusFilter = filter.toProjectStatus();
        List<Project> projects = resolveProjects(user, statusFilter);
        return projects.stream().map(ProjectSummaryDTO::from).toList();
    }

    private List<Project> resolveProjects(User user, Optional<ProjectStatus> statusFilter) {
        if (user.getUserType() == UserType.npo) {
            Optional<Npo> npoOpt = npoRepository.findByUserId(user.getId());
            if (npoOpt.isEmpty()) {
                return List.of();
            }
            Integer npoId = npoOpt.get().getId();
            return statusFilter
                    .map(status -> projectRepository.findByNpoIdAndStatus(npoId, status))
                    .orElseGet(() -> projectRepository.findByNpoId(npoId));
        }

        if (user.getUserType() == UserType.company) {
            Optional<Company> companyOpt = companyRepository.findByUserId(user.getId());
            if (companyOpt.isEmpty()) {
                return List.of();
            }
            Integer companyId = companyOpt.get().getId();
            return statusFilter
                    .map(
                            status ->
                                    projectRepository.findAllByCompanyIdAndStatus(
                                            companyId, status.name()))
                    .orElseGet(() -> projectRepository.findAllByCompanyId(companyId));
        }

        return List.of();
    }
}
