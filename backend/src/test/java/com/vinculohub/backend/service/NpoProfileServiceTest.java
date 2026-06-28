/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.NpoProfileResponse;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.exception.ForbiddenException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class NpoProfileServiceTest {

    @Mock private NpoRepository npoRepository;
    @Mock private AddressRepository addressRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private DocumentRepository documentRepository;

    @InjectMocks private NpoProfileService npoProfileService;

    @Test
    @DisplayName("Deve retornar projetos da ONG com status e ODS no perfil publico")
    void shouldReturnNpoProjectsWithStatusAndOdsOnPublicProfile() {
        User owner =
                User.builder()
                        .id(7)
                        .name("Responsavel")
                        .email("owner@ong.org")
                        .auth0Id("auth0|owner")
                        .userType(UserType.npo)
                        .build();
        Npo npo =
                Npo.builder()
                        .id(10)
                        .name("ONG Publica")
                        .npoSize(NpoSize.small)
                        .userId(owner.getId())
                        .build();
        Ods ods =
                Ods.builder()
                        .id(4)
                        .name("ODS 4 - Educacao de Qualidade")
                        .description("Educacao inclusiva e equitativa.")
                        .build();
        Project project =
                Project.builder()
                        .id(99L)
                        .npo(npo)
                        .title("Projeto Alfabetizacao")
                        .description("Aulas no contraturno.")
                        .status(ProjectStatus.ACTIVE)
                        .ods(new LinkedHashSet<>(List.of(ods)))
                        .createdAt(LocalDateTime.of(2026, 3, 15, 10, 0))
                        .build();

        when(npoRepository.findById(10)).thenReturn(Optional.of(npo));
        when(userRepository.findById(owner.getId())).thenReturn(Optional.of(owner));
        when(projectRepository.findAllByNpoId(10L)).thenReturn(List.of(project));
        when(documentRepository.findByNpo_Id(10)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(10, null);

        assertEquals(NpoProfileResponse.ViewerContext.EXTERNAL, response.viewerContext());
        assertEquals(1, response.projects().size());
        NpoProfileResponse.ProjectData projectData = response.projects().get(0);
        assertEquals("Projeto Alfabetizacao", projectData.title());
        assertEquals(ProjectStatus.ACTIVE, projectData.status());
        assertEquals(1, projectData.ods().size());
        assertEquals(4, projectData.ods().get(0).id());
        assertEquals("ODS 4 - Educacao de Qualidade", projectData.ods().get(0).name());
        assertEquals(LocalDateTime.of(2026, 3, 15, 10, 0), projectData.createdAt());
        verify(projectRepository).findAllByNpoId(10L);
    }

    @Test
    @DisplayName("Deve retornar projetos publicos paginados da ONG")
    void shouldReturnPaginatedPublicProjects() {
        Ods ods =
                Ods.builder()
                        .id(4)
                        .name("ODS 4 - Educacao de Qualidade")
                        .description("Educacao inclusiva e equitativa.")
                        .build();
        Project project =
                Project.builder()
                        .id(99L)
                        .title("Projeto Alfabetizacao")
                        .description("Aulas no contraturno.")
                        .status(ProjectStatus.ACTIVE)
                        .ods(new LinkedHashSet<>(List.of(ods)))
                        .createdAt(LocalDateTime.of(2026, 3, 15, 10, 0))
                        .build();

        when(npoRepository.existsById(10)).thenReturn(true);
        when(projectRepository.findByNpoId(eq(10L), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(project)));

        NpoProfileResponse.ProjectPageData response =
                npoProfileService.getPublicProjects(10, Pageable.ofSize(5));

        assertEquals(1, response.content().size());
        assertEquals(1, response.totalElements());
        assertEquals("Projeto Alfabetizacao", response.content().get(0).title());
        verify(projectRepository).findByNpoId(10L, Pageable.ofSize(5));
    }

    @Test
    @DisplayName("Deve lançar NotFoundException quando a ONG dos projetos públicos não existir")
    void shouldThrowNotFoundWhenPublicProjectsNpoDoesNotExist() {
        when(npoRepository.existsById(999)).thenReturn(false);

        assertThrows(
                NotFoundException.class,
                () -> npoProfileService.getPublicProjects(999, Pageable.ofSize(5)));

        verify(projectRepository, never()).findByNpoId(eq(999L), any(Pageable.class));
    }

    @Test
    @DisplayName("Deve retornar página vazia quando a ONG não possuir projetos públicos")
    void shouldReturnEmptyPageWhenNpoHasNoPublicProjects() {
        Pageable pageable = Pageable.ofSize(5);

        when(npoRepository.existsById(10)).thenReturn(true);
        when(projectRepository.findByNpoId(10L, pageable)).thenReturn(Page.empty(pageable));

        NpoProfileResponse.ProjectPageData response =
                npoProfileService.getPublicProjects(10, pageable);

        assertEquals(0, response.content().size());
        assertEquals(0, response.totalElements());
        assertEquals(0, response.totalPages());
        assertEquals(0, response.number());
        assertEquals(5, response.size());
        verify(projectRepository).findByNpoId(10L, pageable);
    }

    // ------------------------------------------------------------------ getProfile branches

    @Test
    @DisplayName("getProfile com npoId nulo lança IllegalArgumentException")
    void shouldThrowWhenGetProfileNpoIdIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> npoProfileService.getProfile(null, "auth0|x"));
    }

    @Test
    @DisplayName("getProfile com ONG não encontrada lança NotFoundException")
    void shouldThrowNotFoundWhenNpoDoesNotExist() {
        when(npoRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(
                NotFoundException.class,
                () -> npoProfileService.getProfile(999, null));
    }

    @Test
    @DisplayName("getProfile com auth0Id em branco retorna ViewerContext.EXTERNAL")
    void shouldReturnExternalContextWhenAuth0IdIsBlank() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(5, "   ");
        assertEquals(NpoProfileResponse.ViewerContext.EXTERNAL, response.viewerContext());
    }

    @Test
    @DisplayName("getProfile com auth0Id do dono retorna ViewerContext.OWNER")
    void shouldReturnOwnerContextWhenAuth0IdMatches() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(5, "auth0|owner");
        assertEquals(NpoProfileResponse.ViewerContext.OWNER, response.viewerContext());
    }

    @Test
    @DisplayName("getProfile sem userId na ONG retorna responsibleUser nulo e email nulo")
    void shouldHandleNullUserIdInNpo() {
        Npo npo = Npo.builder().id(5).name("ONG sem responsavel").userId(null).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(5, "auth0|someone");
        assertEquals(NpoProfileResponse.ViewerContext.EXTERNAL, response.viewerContext());
        assertNull(response.contact().email());
        assertNull(response.responsible());
        verify(userRepository, never()).findById(any());
    }

    @Test
    @DisplayName("getProfile com projeto sem ODS retorna lista vazia de ODS")
    void shouldReturnEmptyOdsListWhenProjectHasNullOds() {
        Npo npo = Npo.builder().id(5).name("ONG").userId(null).build();
        Project project =
                Project.builder()
                        .id(1L)
                        .title("Proj")
                        .status(ProjectStatus.ACTIVE)
                        .ods(null)
                        .createdAt(LocalDateTime.now())
                        .build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of(project));
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse response = npoProfileService.getProfile(5, null);
        assertEquals(0, response.projects().get(0).ods().size());
    }

    // ------------------------------------------------------------------ getPublicProjects branches

    @Test
    @DisplayName("getPublicProjects com npoId nulo lança IllegalArgumentException")
    void shouldThrowWhenPublicProjectsNpoIdIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> npoProfileService.getPublicProjects(null, Pageable.ofSize(5)));
    }

    // ------------------------------------------------------------------ updateProfile branches

    @Test
    @DisplayName("updateProfile com npoId nulo lança IllegalArgumentException")
    void shouldThrowWhenUpdateProfileNpoIdIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> npoProfileService.updateProfile(null, "auth0|x", new NpoProfileResponse.UpdateRequest(null, null, null, null)));
    }

    @Test
    @DisplayName("updateProfile com request nulo lança IllegalArgumentException")
    void shouldThrowWhenUpdateProfileRequestIsNull() {
        assertThrows(
                IllegalArgumentException.class,
                () -> npoProfileService.updateProfile(1, "auth0|x", null));
    }

    @Test
    @DisplayName("updateProfile com ONG não encontrada lança NotFoundException")
    void shouldThrowNotFoundOnUpdateWhenNpoDoesNotExist() {
        when(npoRepository.findById(999)).thenReturn(Optional.empty());
        assertThrows(
                NotFoundException.class,
                () -> npoProfileService.updateProfile(
                        999, "auth0|x",
                        new NpoProfileResponse.UpdateRequest(null, null, null, null)));
    }

    @Test
    @DisplayName("updateProfile com auth0Id não dono lança ForbiddenException")
    void shouldThrowForbiddenWhenNotOwnerOnUpdate() {
        User owner = User.builder().id(1).auth0Id("auth0|real-owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        assertThrows(
                ForbiddenException.class,
                () -> npoProfileService.updateProfile(
                        5, "auth0|impostor",
                        new NpoProfileResponse.UpdateRequest(null, null, null, null)));
    }

    @Test
    @DisplayName("updateProfile com InstitutionalUpdate com campos em branco/nulos não sobrescreve valores")
    void shouldNotOverwriteFieldsWhenInstitutionalUpdateFieldsAreNullOrBlank() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG Original").userId(1).npoSize(NpoSize.small).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        // All null fields → no updates applied
        NpoProfileResponse.InstitutionalUpdate inst =
                new NpoProfileResponse.InstitutionalUpdate(
                        null, null, null, null, null, null, null, null, null);
        NpoProfileResponse.UpdateRequest req =
                new NpoProfileResponse.UpdateRequest(inst, null, null, null);

        npoProfileService.updateProfile(5, "auth0|owner", req);

        assertEquals("ONG Original", npo.getName());
        assertEquals(NpoSize.small, npo.getNpoSize());
    }

    @Test
    @DisplayName("updateProfile atualiza campos institucionais não nulos")
    void shouldApplyInstitutionalUpdate() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("old@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG Velha").userId(1).npoSize(NpoSize.small).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.InstitutionalUpdate inst =
                new NpoProfileResponse.InstitutionalUpdate(
                        "ONG Nova", "desc nova", null, NpoSize.medium,
                        null, null, true, false, true);
        NpoProfileResponse.UpdateRequest req =
                new NpoProfileResponse.UpdateRequest(inst, null, null, null);

        npoProfileService.updateProfile(5, "auth0|owner", req);

        assertEquals("ONG Nova", npo.getName());
        assertEquals(NpoSize.medium, npo.getNpoSize());
    }

    @Test
    @DisplayName("updateProfile com contactData atualiza telefone e email do responsavel")
    void shouldApplyContactUpdate() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("old@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ContactUpdate contact =
                new NpoProfileResponse.ContactUpdate("new@email.com", "(11) 99999-0000");
        NpoProfileResponse.UpdateRequest req =
                new NpoProfileResponse.UpdateRequest(null, contact, null, null);

        npoProfileService.updateProfile(5, "auth0|owner", req);

        assertEquals("(11) 99999-0000", npo.getPhone());
        assertEquals("new@email.com", owner.getEmail());
    }

    @Test
    @DisplayName("updateProfile com address nulo na ONG cria novo Address")
    void shouldCreateNewAddressWhenNpoHasNone() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).address(null).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(addressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.AddressUpdate addrUpdate =
                new NpoProfileResponse.AddressUpdate("São Paulo", "SP", "São Paulo", "Rua A", "1", null, "01000-000");
        NpoProfileResponse.UpdateRequest req =
                new NpoProfileResponse.UpdateRequest(null, null, addrUpdate, null);

        npoProfileService.updateProfile(5, "auth0|owner", req);

        verify(addressRepository).save(any(Address.class));
        assertNotNull(npo.getAddress());
    }

    @Test
    @DisplayName("updateProfile com nome em branco não sobrescreve o nome da ONG")
    void shouldNotOverwriteNameWhenBlank() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG Original").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.InstitutionalUpdate inst =
                new NpoProfileResponse.InstitutionalUpdate(
                        "   ", null, null, null, null, null, null, null, null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(inst, null, null, null));

        assertEquals("ONG Original", npo.getName());
    }

    @Test
    @DisplayName("updateProfile com email em branco no contactData não atualiza email")
    void shouldNotUpdateEmailWhenContactEmailIsBlank() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("old@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ContactUpdate contact =
                new NpoProfileResponse.ContactUpdate("  ", null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, contact, null, null));

        assertEquals("old@o.com", owner.getEmail());
    }

    @Test
    @DisplayName("updateProfile com responsibleUpdate atualiza nome e email")
    void shouldApplyResponsibleUpdate() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").name("Old Name").email("old@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ResponsibleUpdate resp =
                new NpoProfileResponse.ResponsibleUpdate("Novo Nome", "novo@email.com");
        NpoProfileResponse.UpdateRequest req =
                new NpoProfileResponse.UpdateRequest(null, null, null, resp);

        npoProfileService.updateProfile(5, "auth0|owner", req);

        assertEquals("Novo Nome", owner.getName());
        assertEquals("novo@email.com", owner.getEmail());
    }

    @Test
    @DisplayName("updateProfile com nome em branco no responsibleUpdate não atualiza")
    void shouldNotUpdateResponsibleNameWhenBlank() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").name("Old Name").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ResponsibleUpdate resp =
                new NpoProfileResponse.ResponsibleUpdate("   ", "   ");
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, null, null, resp));

        assertEquals("Old Name", owner.getName());
    }

    @Test
    @DisplayName("updateProfile com auth0Id nulo lança ForbiddenException via isOwner")
    void shouldThrowForbiddenWhenAuth0IdIsNullForIsOwner() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        assertThrows(ForbiddenException.class,
                () -> npoProfileService.updateProfile(5, null,
                        new NpoProfileResponse.UpdateRequest(null, null, null, null)));
    }

    @Test
    @DisplayName("updateProfile com institutionalData cobrindo logoUrl, cnpj e cpf não nulos")
    void shouldApplyInstitutionalUpdateForLogoUrlCnpjCpf() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.InstitutionalUpdate inst =
                new NpoProfileResponse.InstitutionalUpdate(
                        null, null, "https://logo.png", null,
                        "12345678000100", "12345678900", null, null, null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(inst, null, null, null));

        assertEquals("https://logo.png", npo.getLogoUrl());
        assertEquals("12345678000100", npo.getCnpj());
        assertEquals("12345678900", npo.getCpf());
    }

    @Test
    @DisplayName("updateProfile com phone em branco no contactData chama trimToNull")
    void shouldCallTrimToNullForBlankPhone() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").phone("(11) 1111-1111").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ContactUpdate contact = new NpoProfileResponse.ContactUpdate(null, "  ");
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, contact, null, null));

        assertNull(npo.getPhone());
    }

    @Test
    @DisplayName("updateProfile com complement não nulo no address update")
    void shouldUpdateAddressComplement() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).address(null).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(addressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.AddressUpdate addrUpdate =
                new NpoProfileResponse.AddressUpdate(null, null, null, null, null, "Sala 2", null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, null, addrUpdate, null));

        assertEquals("Sala 2", npo.getAddress().getComplement());
    }

    @Test
    @DisplayName("updateProfile com responsibleUpdate campos nulos não atualiza")
    void shouldNotUpdateResponsibleWhenFieldsAreNull() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").name("Old").email("old@o.com").build();
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.ResponsibleUpdate resp = new NpoProfileResponse.ResponsibleUpdate(null, null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, null, null, resp));

        assertEquals("Old", owner.getName());
        assertEquals("old@o.com", owner.getEmail());
    }

    @Test
    @DisplayName("getProfile com documento com projeto retorna projectId não nulo")
    void shouldReturnProjectIdInDocumentWhenProjectPresent() {
        Npo npo = Npo.builder().id(5).name("ONG").userId(null).build();
        Project project = Project.builder().id(7L).title("Proj").status(ProjectStatus.ACTIVE)
                .ods(new LinkedHashSet<>()).createdAt(LocalDateTime.now()).build();
        com.vinculohub.backend.model.Document doc = new com.vinculohub.backend.model.Document();
        doc.setId(1);
        doc.setTitle("Doc");
        doc.setProject(project);

        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of(doc));

        NpoProfileResponse response = npoProfileService.getProfile(5, null);

        assertEquals(7L, response.documents().get(0).projectId());
    }

    @Test
    @DisplayName("updateProfile com address existente atualiza endereço sem criar novo")
    void shouldUpdateExistingAddress() {
        User owner = User.builder().id(1).auth0Id("auth0|owner").email("o@o.com").build();
        Address existing = new Address();
        existing.setId(99);
        existing.setCity("Porto Alegre");
        Npo npo = Npo.builder().id(5).name("ONG").userId(1).address(existing).build();
        when(npoRepository.findById(5)).thenReturn(Optional.of(npo));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(addressRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(npoRepository.save(any())).thenReturn(npo);
        when(userRepository.save(any())).thenReturn(owner);
        when(projectRepository.findAllByNpoId(5L)).thenReturn(List.of());
        when(documentRepository.findByNpo_Id(5)).thenReturn(List.of());

        NpoProfileResponse.AddressUpdate addrUpdate =
                new NpoProfileResponse.AddressUpdate(null, null, "São Paulo", null, null, null, null);
        npoProfileService.updateProfile(5, "auth0|owner",
                new NpoProfileResponse.UpdateRequest(null, null, addrUpdate, null));

        assertEquals("São Paulo", existing.getCity());
        assertEquals(99, (int) existing.getId());
    }
}
