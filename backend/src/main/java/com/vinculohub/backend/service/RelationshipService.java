/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CreateRelationshipRequest;
import com.vinculohub.backend.dto.OverduePartnershipAlertResponse;
import com.vinculohub.backend.dto.RelationshipListItemResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.exception.UserNotFoundException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.service.notification.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Backend for the "Vínculos" epic (VNC-01..04): listing relationships, the 1st handshake (interest
 * + accept/reject with contact reveal) and the 2nd handshake (bilateral confirmation that activates
 * the partnership). A relationship is always tied to a specific {@link Project}; the actor (Company
 * or NPO) is resolved from the authenticated user, since companies have no dedicated role.
 */
@Service
@RequiredArgsConstructor
public class RelationshipService {

    private static final List<RelationshipStatus> CONTACT_VISIBLE_STATUSES =
            List.of(RelationshipStatus.negotiation, RelationshipStatus.active);

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final ProjectRepository projectRepository;
    private final CompanyProjectRepository companyProjectRepository;
    private final NotificationService notificationService;

    private enum ActorRole {
        COMPANY,
        NPO
    }

    private record ResolvedActor(ActorRole role, Company company, Npo npo) {
        boolean isCompany() {
            return role == ActorRole.COMPANY;
        }
    }

    // ----------------------------------------------------------------------------------------
    // ADM-06 — overdue pending alert (admin)
    // ----------------------------------------------------------------------------------------

    private static final int OVERDUE_DAYS = 7;

    @Transactional(readOnly = true)
    public List<OverduePartnershipAlertResponse> listOverdueRelationshipsForAdmin() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(OVERDUE_DAYS);
        return companyProjectRepository.findOverduePendingRelationships(threshold).stream()
                .map(
                        cp ->
                                new OverduePartnershipAlertResponse(
                                        cp.getCompany().getId(),
                                        companyName(cp.getCompany()),
                                        cp.getProject().getNpo().getId(),
                                        npoName(cp.getProject().getNpo()),
                                        cp.getProject().getId(),
                                        cp.getProject().getTitle(),
                                        cp.getCreatedAt()))
                .toList();
    }

    // ----------------------------------------------------------------------------------------
    // VNC-01 — list
    // ----------------------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<RelationshipListItemResponse> listMyRelationships(
            String auth0Id, RelationshipStatus status) {
        validateStatus(status);
        ResolvedActor actor = resolveActor(auth0Id);

        if (actor.isCompany()) {
            Integer companyId = actor.company().getId();
            List<CompanyProject> relationships =
                    status == null
                            ? companyProjectRepository.findVisibleRelationshipsByCompanyId(
                                    companyId)
                            : companyProjectRepository.findRelationshipsByCompanyIdAndStatusIn(
                                    companyId, List.of(status));
            return relationships.stream().map(this::toCompanyViewerResponse).toList();
        }

        Integer npoId = actor.npo().getId();
        List<CompanyProject> relationships =
                status == null
                        ? companyProjectRepository.findVisibleRelationshipsByNpoId(npoId)
                        : companyProjectRepository.findRelationshipsByNpoIdAndStatusIn(
                                npoId, List.of(status));
        return relationships.stream().map(this::toNpoViewerResponse).toList();
    }

    // ----------------------------------------------------------------------------------------
    // VNC-02 — initiate (1st handshake, send)
    // ----------------------------------------------------------------------------------------

    @Transactional
    public void createRelationship(String auth0Id, CreateRelationshipRequest request) {
        if (request == null || request.projectId() == null) {
            throw new BadRequestException("projectId é obrigatório.");
        }
        ResolvedActor actor = resolveActor(auth0Id);

        Project project =
                projectRepository
                        .findById(request.projectId())
                        .orElseThrow(() -> new NotFoundException("Projeto não encontrado."));

        if (project.getStatus() != ProjectStatus.ACTIVE) {
            throw new BadRequestException("Só é possível iniciar vínculo em um projeto ativo.");
        }

        Company company;
        InitiatorType initiatorType;
        if (actor.isCompany()) {
            company = actor.company();
            initiatorType = InitiatorType.company;
        } else {
            Npo npo = actor.npo();
            if (!npo.getId().equals(project.getNpo().getId())) {
                throw new BadRequestException("O projeto selecionado não pertence à sua ONG.");
            }
            if (request.companyId() == null) {
                throw new BadRequestException(
                        "companyId é obrigatório quando a ONG inicia o vínculo.");
            }
            company =
                    companyRepository
                            .findById(request.companyId())
                            .orElseThrow(() -> new NotFoundException("Empresa não encontrada."));
            initiatorType = InitiatorType.npo;
        }

        CompanyProject relationship =
                companyProjectRepository
                        .findByIdWithGraph(company.getId(), project.getId())
                        .orElse(null);

        if (relationship != null
                && CompanyProjectRepository.VISIBLE_RELATIONSHIP_STATUSES.contains(
                        relationship.getStatus())) {
            throw new BadRequestException("Já existe um vínculo em andamento para este projeto.");
        }

        if (relationship == null) {
            relationship =
                    CompanyProject.builder()
                            .id(new CompanyProjectId(company.getId(), project.getId()))
                            .company(company)
                            .project(project)
                            .build();
        }
        relationship.setStatus(RelationshipStatus.pending);
        relationship.setInitiatorType(initiatorType);
        relationship.setRespondedAt(null);
        relationship.setCompanyConfirmedAt(null);
        relationship.setNpoConfirmedAt(null);
        companyProjectRepository.save(relationship);

        // Notify the receptor (the party that did NOT initiate).
        Npo npo = project.getNpo();
        if (initiatorType == InitiatorType.company) {
            notificationService.interestReceived(
                    npoEmail(npo), project.getTitle(), companyName(company));
        } else {
            notificationService.interestReceived(
                    companyEmail(company), project.getTitle(), npoName(npo));
        }
    }

    // ----------------------------------------------------------------------------------------
    // VNC-03 — respond (1st handshake, accept/reject)
    // ----------------------------------------------------------------------------------------

    @Transactional
    public void acceptRelationship(String auth0Id, Integer companyId, Long projectId) {
        respond(auth0Id, companyId, projectId, true);
    }

    @Transactional
    public void rejectRelationship(String auth0Id, Integer companyId, Long projectId) {
        respond(auth0Id, companyId, projectId, false);
    }

    private void respond(String auth0Id, Integer companyId, Long projectId, boolean accept) {
        ResolvedActor actor = resolveActor(auth0Id);
        CompanyProject relationship = loadParticipantRelationship(actor, companyId, projectId);

        RelationshipStatus current = relationship.getStatus();
        boolean isPendingResponse = current == RelationshipStatus.pending;
        boolean isCancellingNegotiation = !accept && current == RelationshipStatus.negotiation;

        if (!isPendingResponse && !isCancellingNegotiation) {
            throw new BadRequestException("Este vínculo não pode ser respondido no estado atual.");
        }
        if (isPendingResponse) {
            requireReceptor(actor, relationship);
        }

        Company company = relationship.getCompany();
        Npo npo = relationship.getProject().getNpo();
        String projectName = relationship.getProject().getTitle();
        boolean companyInitiated = relationship.getInitiatorType() == InitiatorType.company;

        relationship.setRespondedAt(LocalDateTime.now());
        relationship.setStatus(
                accept ? RelationshipStatus.negotiation : RelationshipStatus.inactive);
        companyProjectRepository.save(relationship);

        if (isCancellingNegotiation) {
            // Notify the OTHER party (counterpart of the actor that cancelled).
            String counterpartEmail = actor.isCompany() ? npoEmail(npo) : companyEmail(company);
            String actorName = actor.isCompany() ? companyName(company) : npoName(npo);
            notificationService.negotiationCancelled(counterpartEmail, projectName, actorName);
            return;
        }

        // 1st handshake response: notify the initiator.
        String initiatorEmail = companyInitiated ? companyEmail(company) : npoEmail(npo);
        String partnerName = companyInitiated ? npoName(npo) : companyName(company);
        if (accept) {
            notificationService.interestAccepted(initiatorEmail, projectName, partnerName);
        } else {
            notificationService.interestRejected(initiatorEmail, projectName, partnerName);
        }
    }

    // ----------------------------------------------------------------------------------------
    // VNC-04 — confirm (2nd handshake, bilateral)
    // ----------------------------------------------------------------------------------------

    @Transactional
    public void confirmRelationship(String auth0Id, Integer companyId, Long projectId) {
        ResolvedActor actor = resolveActor(auth0Id);
        CompanyProject relationship = loadParticipantRelationship(actor, companyId, projectId);

        if (relationship.getStatus() != RelationshipStatus.negotiation) {
            throw new BadRequestException("Só é possível efetivar vínculos em negociação.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (actor.isCompany()) {
            if (relationship.getCompanyConfirmedAt() == null) {
                relationship.setCompanyConfirmedAt(now);
            }
        } else {
            if (relationship.getNpoConfirmedAt() == null) {
                relationship.setNpoConfirmedAt(now);
            }
        }

        Company company = relationship.getCompany();
        Npo npo = relationship.getProject().getNpo();
        String projectName = relationship.getProject().getTitle();

        boolean bothConfirmed =
                relationship.getCompanyConfirmedAt() != null
                        && relationship.getNpoConfirmedAt() != null;
        if (bothConfirmed) {
            relationship.setStatus(RelationshipStatus.active);
        }
        companyProjectRepository.save(relationship);

        if (bothConfirmed) {
            notificationService.partnershipActivated(
                    companyEmail(company), projectName, npoName(npo));
            notificationService.partnershipActivated(
                    npoEmail(npo), projectName, companyName(company));
        } else if (actor.isCompany()) {
            notificationService.confirmationRequested(
                    npoEmail(npo), projectName, companyName(company));
        } else {
            notificationService.confirmationRequested(
                    companyEmail(company), projectName, npoName(npo));
        }
    }

    // ----------------------------------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------------------------------

    private ResolvedActor resolveActor(String auth0Id) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Não foi possível identificar o usuário autenticado.");
        }
        User user = userRepository.findByAuth0Id(auth0Id).orElseThrow(UserNotFoundException::new);

        return companyRepository
                .findByUserId(user.getId())
                .map(company -> new ResolvedActor(ActorRole.COMPANY, company, null))
                .orElseGet(
                        () -> {
                            Npo npo =
                                    npoRepository
                                            .findByUserId(user.getId())
                                            .orElseThrow(
                                                    () ->
                                                            new NotFoundException(
                                                                    "Perfil de empresa ou ONG não"
                                                                            + " encontrado"));
                            return new ResolvedActor(ActorRole.NPO, null, npo);
                        });
    }

    private CompanyProject loadParticipantRelationship(
            ResolvedActor actor, Integer companyId, Long projectId) {
        CompanyProject relationship =
                companyProjectRepository
                        .findByIdWithGraph(companyId, projectId)
                        .orElseThrow(() -> new NotFoundException("Vínculo não encontrado."));

        boolean participant =
                actor.isCompany()
                        ? actor.company().getId().equals(relationship.getCompany().getId())
                        : actor.npo().getId().equals(relationship.getProject().getNpo().getId());
        if (!participant) {
            throw new ForbiddenException("Você não participa deste vínculo.");
        }
        return relationship;
    }

    private void requireReceptor(ResolvedActor actor, CompanyProject relationship) {
        boolean isReceptor =
                actor.isCompany()
                        ? relationship.getInitiatorType() == InitiatorType.npo
                        : relationship.getInitiatorType() == InitiatorType.company;
        if (!isReceptor) {
            throw new ForbiddenException("Apenas a parte receptora pode responder a este vínculo.");
        }
    }

    private void validateStatus(RelationshipStatus status) {
        if (status != null
                && !CompanyProjectRepository.VISIBLE_RELATIONSHIP_STATUSES.contains(status)) {
            throw new BadRequestException("Status inválido para Meus Vínculos.");
        }
    }

    private RelationshipListItemResponse toCompanyViewerResponse(CompanyProject relationship) {
        Project project = relationship.getProject();
        Npo partner = project.getNpo();
        boolean contactVisible = CONTACT_VISIBLE_STATUSES.contains(relationship.getStatus());

        return new RelationshipListItemResponse(
                project.getId(),
                project.getTitle(),
                partner.getId(),
                npoName(partner),
                relationship.getStatus(),
                contactVisible ? npoEmail(partner) : null,
                contactVisible ? partner.getPhone() : null,
                relationship.getStatus() == RelationshipStatus.pending
                        && relationship.getInitiatorType() == InitiatorType.npo,
                relationship.getStatus() == RelationshipStatus.negotiation
                        && relationship.getCompanyConfirmedAt() == null);
    }

    private RelationshipListItemResponse toNpoViewerResponse(CompanyProject relationship) {
        Project project = relationship.getProject();
        Company partner = relationship.getCompany();
        boolean contactVisible = CONTACT_VISIBLE_STATUSES.contains(relationship.getStatus());

        return new RelationshipListItemResponse(
                project.getId(),
                project.getTitle(),
                partner.getId(),
                companyName(partner),
                relationship.getStatus(),
                contactVisible ? companyEmail(partner) : null,
                contactVisible ? partner.getPhone() : null,
                relationship.getStatus() == RelationshipStatus.pending
                        && relationship.getInitiatorType() == InitiatorType.company,
                relationship.getStatus() == RelationshipStatus.negotiation
                        && relationship.getNpoConfirmedAt() == null);
    }

    private String companyName(Company company) {
        String social = company.getSocialName();
        if (social != null && !social.isBlank()) {
            return social;
        }
        return company.getLegalName();
    }

    private String npoName(Npo npo) {
        return npo.getName();
    }

    private String companyEmail(Company company) {
        User user = company.getUser();
        return user == null ? null : user.getEmail();
    }

    private String npoEmail(Npo npo) {
        // Preferimos a associação já carregada via JOIN FETCH (evita N+1 na listagem); caímos no
        // repositório apenas quando o npoUser não veio no fetch graph.
        if (npo.getNpoUser() != null) {
            return npo.getNpoUser().getEmail();
        }
        if (npo.getUserId() == null) {
            return null;
        }
        return userRepository.findById(npo.getUserId()).map(User::getEmail).orElse(null);
    }
}
