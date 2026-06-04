/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.RelationshipListItemResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RelationshipService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final CompanyProjectRepository companyProjectRepository;

    @Transactional(readOnly = true)
    public List<RelationshipListItemResponse> listMyRelationships(
            String auth0Id, RelationshipStatus status) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }

        validateStatus(status);

        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        return companyRepository
                .findByUserId(user.getId())
                .map(company -> listCompanyRelationships(company, status))
                .orElseGet(() -> listNpoRelationships(user.getId(), status));
    }

    private void validateStatus(RelationshipStatus status) {
        if (status != null
                && !CompanyProjectRepository.VISIBLE_RELATIONSHIP_STATUSES.contains(status)) {
            throw new BadRequestException(
                    "Status inválido para Meus Vínculos.");
        }
    }

    private List<RelationshipListItemResponse> listCompanyRelationships(
            Company company, RelationshipStatus status) {
        List<CompanyProject> relationships =
                status == null
                        ? companyProjectRepository.findVisibleRelationshipsByCompanyId(
                                company.getId())
                        : companyProjectRepository.findRelationshipsByCompanyIdAndStatusIn(
                                company.getId(), List.of(status));

        return relationships.stream().map(this::toCompanyResponse).toList();
    }

    private List<RelationshipListItemResponse> listNpoRelationships(
            Integer userId, RelationshipStatus status) {
        Npo npo =
                npoRepository
                        .findByUserId(userId)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Perfil de empresa ou ONG não encontrado"));

        List<CompanyProject> relationships =
                status == null
                        ? companyProjectRepository.findVisibleRelationshipsByNpoId(npo.getId())
                        : companyProjectRepository.findRelationshipsByNpoIdAndStatusIn(
                                npo.getId(), List.of(status));

        return relationships.stream().map(this::toNpoResponse).toList();
    }

    private RelationshipListItemResponse toCompanyResponse(CompanyProject relationship) {
        Project project = relationship.getProject();
        Npo partner = project.getNpo();

        return new RelationshipListItemResponse(
                project.getId(),
                project.getTitle(),
                partner.getId(),
                partner.getName(),
                relationship.getStatus());
    }

    private RelationshipListItemResponse toNpoResponse(CompanyProject relationship) {
        Project project = relationship.getProject();
        Company partner = relationship.getCompany();

        return new RelationshipListItemResponse(
                project.getId(),
                project.getTitle(),
                partner.getId(),
                firstPresent(partner.getSocialName(), partner.getLegalName()),
                relationship.getStatus());
    }

    private String firstPresent(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }

        return second;
    }
}
