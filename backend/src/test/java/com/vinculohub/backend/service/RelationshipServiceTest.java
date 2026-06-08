/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.CreateRelationshipRequest;
import com.vinculohub.backend.dto.RelationshipListItemResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.CompanyProject;
import com.vinculohub.backend.model.CompanyProjectId;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.InitiatorType;
import com.vinculohub.backend.model.enums.RelationshipStatus;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.service.notification.NotificationService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RelationshipServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private NpoRepository npoRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private CompanyProjectRepository companyProjectRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private RelationshipService relationshipService;

    private static final String COMPANY_AUTH = "auth0|company";
    private static final String NPO_AUTH = "auth0|npo";

    private User companyUser;
    private User npoUser;
    private Company company;
    private Npo npo;
    private Project project;

    @BeforeEach
    void setup() {
        companyUser = User.builder().id(1).email("empresa@corp.com").auth0Id(COMPANY_AUTH).build();
        npoUser = User.builder().id(2).email("contato@ong.org").auth0Id(NPO_AUTH).build();

        company = new Company();
        company.setId(10);
        company.setSocialName("Corp S.A.");
        company.setLegalName("Corporation Ltda");
        company.setPhone("(11) 1111-1111");
        company.setUser(companyUser);

        npo =
                Npo.builder()
                        .id(20)
                        .name("ONG Boa")
                        .userId(npoUser.getId())
                        .phone("(11) 2222-2222")
                        .build();
        project = Project.builder().id(100L).npo(npo).title("Projeto Verde").build();
    }

    private void mockCompanyActor() {
        when(userRepository.findByAuth0Id(COMPANY_AUTH)).thenReturn(Optional.of(companyUser));
        when(companyRepository.findByUserId(companyUser.getId())).thenReturn(Optional.of(company));
    }

    private void mockNpoActor() {
        when(userRepository.findByAuth0Id(NPO_AUTH)).thenReturn(Optional.of(npoUser));
        when(companyRepository.findByUserId(npoUser.getId())).thenReturn(Optional.empty());
        when(npoRepository.findByUserId(npoUser.getId())).thenReturn(Optional.of(npo));
    }

    private CompanyProject relationship(RelationshipStatus status, InitiatorType initiator) {
        return CompanyProject.builder()
                .id(new CompanyProjectId(company.getId(), project.getId()))
                .company(company)
                .project(project)
                .status(status)
                .initiatorType(initiator)
                .build();
    }

    // ---------------------------------------------------------------------------------------- list

    @Test
    @DisplayName("VNC-01: status inválido para o painel lança BadRequest")
    void listRejectsInvalidStatus() {
        assertThrows(
                BadRequestException.class,
                () ->
                        relationshipService.listMyRelationships(
                                COMPANY_AUTH, RelationshipStatus.inactive));
    }

    @Test
    @DisplayName("VNC-01: contato fica oculto enquanto pending e visível em negotiation")
    void listHidesContactWhilePending() {
        mockCompanyActor();
        when(userRepository.findById(npo.getUserId())).thenReturn(Optional.of(npoUser));
        when(companyProjectRepository.findVisibleRelationshipsByCompanyId(company.getId()))
                .thenReturn(
                        List.of(
                                relationship(RelationshipStatus.pending, InitiatorType.npo),
                                relationship(
                                        RelationshipStatus.negotiation, InitiatorType.company)));

        List<RelationshipListItemResponse> result =
                relationshipService.listMyRelationships(COMPANY_AUTH, null);

        assertEquals(2, result.size());
        RelationshipListItemResponse pending = result.get(0);
        assertEquals("ONG Boa", pending.partnerInstitutionName());
        assertNull(pending.partnerContactEmail());
        assertTrue(pending.canRespond(), "company é receptor quando npo iniciou");

        RelationshipListItemResponse negotiation = result.get(1);
        assertEquals("contato@ong.org", negotiation.partnerContactEmail());
        assertEquals("(11) 2222-2222", negotiation.partnerContactPhone());
        assertTrue(negotiation.canConfirm());
    }

    // -------------------------------------------------------------------------------------- create

    @Test
    @DisplayName("VNC-02: empresa cria vínculo pending e notifica a ONG receptora")
    void createByCompanyNotifiesNpo() {
        mockCompanyActor();
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.empty());
        when(userRepository.findById(npo.getUserId())).thenReturn(Optional.of(npoUser));

        relationshipService.createRelationship(
                COMPANY_AUTH, new CreateRelationshipRequest(project.getId(), null));

        ArgumentCaptor<CompanyProject> captor = ArgumentCaptor.forClass(CompanyProject.class);
        verify(companyProjectRepository).save(captor.capture());
        assertEquals(RelationshipStatus.pending, captor.getValue().getStatus());
        assertEquals(InitiatorType.company, captor.getValue().getInitiatorType());
        verify(notificationService).interestReceived(eq("contato@ong.org"), any(), any());
    }

    @Test
    @DisplayName("VNC-02: ONG não pode propor parceria com projeto que não é seu")
    void createByNpoRejectsForeignProject() {
        mockNpoActor();
        Npo otherNpo = Npo.builder().id(99).name("Outra").build();
        Project foreign = Project.builder().id(100L).npo(otherNpo).title("Alheio").build();
        when(projectRepository.findById(foreign.getId())).thenReturn(Optional.of(foreign));

        assertThrows(
                BadRequestException.class,
                () ->
                        relationshipService.createRelationship(
                                NPO_AUTH,
                                new CreateRelationshipRequest(foreign.getId(), company.getId())));
        verify(companyProjectRepository, never()).save(any());
    }

    @Test
    @DisplayName("VNC-02: vínculo visível já existente é rejeitado")
    void createRejectsDuplicateVisible() {
        mockCompanyActor();
        when(projectRepository.findById(project.getId())).thenReturn(Optional.of(project));
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(
                        Optional.of(
                                relationship(
                                        RelationshipStatus.negotiation, InitiatorType.company)));

        assertThrows(
                BadRequestException.class,
                () ->
                        relationshipService.createRelationship(
                                COMPANY_AUTH,
                                new CreateRelationshipRequest(project.getId(), null)));
        verify(companyProjectRepository, never()).save(any());
    }

    // ------------------------------------------------------------------------------- accept/reject

    @Test
    @DisplayName("VNC-03: receptor (ONG) aceita -> negotiation e notifica iniciador")
    void acceptByReceptorMovesToNegotiation() {
        mockNpoActor();
        CompanyProject rel = relationship(RelationshipStatus.pending, InitiatorType.company);
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));

        relationshipService.acceptRelationship(NPO_AUTH, company.getId(), project.getId());

        assertEquals(RelationshipStatus.negotiation, rel.getStatus());
        assertTrue(rel.getRespondedAt() != null);
        verify(notificationService).interestAccepted(eq("empresa@corp.com"), any(), any());
    }

    @Test
    @DisplayName("VNC-03: iniciador não pode aceitar o próprio interesse (Forbidden)")
    void acceptByInitiatorIsForbidden() {
        // Company initiated; company tries to accept -> it is NOT the receptor.
        mockCompanyActor();
        CompanyProject rel = relationship(RelationshipStatus.pending, InitiatorType.company);
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));

        assertThrows(
                ForbiddenException.class,
                () ->
                        relationshipService.acceptRelationship(
                                COMPANY_AUTH, company.getId(), project.getId()));
    }

    @Test
    @DisplayName("VNC-03: recusar encerra o vínculo (inactive)")
    void rejectClosesRelationship() {
        mockNpoActor();
        CompanyProject rel = relationship(RelationshipStatus.pending, InitiatorType.company);
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));

        relationshipService.rejectRelationship(NPO_AUTH, company.getId(), project.getId());

        assertEquals(RelationshipStatus.inactive, rel.getStatus());
        verify(notificationService).interestRejected(eq("empresa@corp.com"), any(), any());
    }

    // ------------------------------------------------------------------------------------- confirm

    @Test
    @DisplayName("VNC-04: uma confirmação mantém negotiation e pede confirmação à outra parte")
    void confirmSingleSideStaysNegotiation() {
        mockCompanyActor();
        CompanyProject rel = relationship(RelationshipStatus.negotiation, InitiatorType.company);
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));
        when(userRepository.findById(npo.getUserId())).thenReturn(Optional.of(npoUser));

        relationshipService.confirmRelationship(COMPANY_AUTH, company.getId(), project.getId());

        assertEquals(RelationshipStatus.negotiation, rel.getStatus());
        assertTrue(rel.getCompanyConfirmedAt() != null);
        assertNull(rel.getNpoConfirmedAt());
        verify(notificationService).confirmationRequested(eq("contato@ong.org"), any(), any());
    }

    @Test
    @DisplayName("VNC-04: confirmação das duas partes ativa o vínculo e notifica ambos")
    void confirmBothSidesActivates() {
        mockNpoActor();
        CompanyProject rel = relationship(RelationshipStatus.negotiation, InitiatorType.company);
        rel.setCompanyConfirmedAt(LocalDateTime.now()); // empresa já confirmou
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));
        when(userRepository.findById(npo.getUserId())).thenReturn(Optional.of(npoUser));

        relationshipService.confirmRelationship(NPO_AUTH, company.getId(), project.getId());

        assertEquals(RelationshipStatus.active, rel.getStatus());
        verify(notificationService).partnershipActivated(eq("empresa@corp.com"), any(), any());
        verify(notificationService).partnershipActivated(eq("contato@ong.org"), any(), any());
    }

    @Test
    @DisplayName("VNC-04: só é possível efetivar a partir de negotiation")
    void confirmRequiresNegotiation() {
        mockCompanyActor();
        CompanyProject rel = relationship(RelationshipStatus.pending, InitiatorType.company);
        when(companyProjectRepository.findByIdWithGraph(company.getId(), project.getId()))
                .thenReturn(Optional.of(rel));

        assertThrows(
                BadRequestException.class,
                () ->
                        relationshipService.confirmRelationship(
                                COMPANY_AUTH, company.getId(), project.getId()));
        assertFalse(rel.getStatus() == RelationshipStatus.active);
    }
}
