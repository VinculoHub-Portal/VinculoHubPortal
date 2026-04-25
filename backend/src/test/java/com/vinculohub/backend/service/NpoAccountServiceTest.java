/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.AddressSignupRequest;
import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupRequest;
import com.vinculohub.backend.dto.NpoInstitutionalSignupResponse;
import com.vinculohub.backend.exception.DuplicateLoginException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.UsersRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.transaction.annotation.Transactional;

@ExtendWith(MockitoExtension.class)
class NpoAccountServiceTest {

    @Mock private UsersRepository usersRepository;

    @Mock private NpoService npoService;

    @Mock private NpoDocumentService npoDocumentService;

    @Mock private NpoEsgService npoEsgService;

    @Mock private ProjectService projectService;

    @Mock private ProjectValidationService projectValidationService;

    @InjectMocks private NpoAccountService npoAccountService;

    @Test
    @DisplayName("Deve registrar Users + Npo + Project na mesma operação transacional")
    void shouldRegisterUserAndNpoAccount() {
        NpoInstitutionalSignupRequest request = validRequest();

        when(usersRepository.existsByAuth0Id("auth0|npo")).thenReturn(false);
        when(usersRepository.existsByEmailIgnoreCase("contato@ong.org")).thenReturn(false);
        when(usersRepository.save(any(Users.class)))
                .thenAnswer(
                        invocation -> {
                            Users user = invocation.getArgument(0);
                            user.setId(10);
                            return user;
                        });
        when(npoDocumentService.sanitizeCpf("529.982.247-25")).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(null)).thenReturn(null);

        when(npoService.saveWithAddress(any(Npo.class), any(Address.class)))
                .thenAnswer(
                        invocation -> {
                            Npo npo = invocation.getArgument(0);
                            npo.setId(20);
                            return npo;
                        });

        when(projectService.createFirstProject(
                        any(Npo.class), any(NpoFirstProjectSignupRequest.class)))
                .thenAnswer(
                        invocation -> {
                            Npo npo = invocation.getArgument(0);
                            NpoFirstProjectSignupRequest firstProject = invocation.getArgument(1);

                            Project project =
                                    Project.builder()
                                            .npo(npo)
                                            .title(firstProject.name())
                                            .description(firstProject.description())
                                            .budgetNeeded(firstProject.capital())
                                            .build();

                            project.setId(30L);
                            return project;
                        });

        NpoInstitutionalSignupResponse response =
                npoAccountService.registerInstitutionalAccount(
                        "auth0|npo", " Contato@ONG.org ", request);

        verify(projectValidationService).validateFirstProject(request.firstProject());
        verify(projectService).createFirstProject(any(Npo.class), eq(request.firstProject()));

        assertEquals(10, response.userId());
        assertEquals(20, response.npoId());
        assertEquals(30L, response.projectId());
        assertEquals("contato@ong.org", response.email());
        assertTrue(response.accessReleased());

        ArgumentCaptor<Users> userCaptor = ArgumentCaptor.forClass(Users.class);
        ArgumentCaptor<Npo> npoCaptor = ArgumentCaptor.forClass(Npo.class);
        ArgumentCaptor<Address> addressCaptor = ArgumentCaptor.forClass(Address.class);

        verify(usersRepository).save(userCaptor.capture());
        verify(npoService).saveWithAddress(npoCaptor.capture(), addressCaptor.capture());
        verify(projectService).createFirstProject(any(Npo.class), eq(request.firstProject()));

        verify(npoDocumentService).validateDocuments("529.982.247-25", null);
        verify(npoEsgService).validateEsgSelection(true, false, false);

        Users savedUser = userCaptor.getValue();
        assertEquals("ONG Exemplo", savedUser.getName());
        assertEquals("contato@ong.org", savedUser.getEmail());
        assertEquals("auth0|npo", savedUser.getAuth0Id());
        assertEquals(UserType.npo, savedUser.getUserType());

        Npo savedNpo = npoCaptor.getValue();
        assertEquals(10, savedNpo.getUserId());
        assertEquals(NpoSize.small, savedNpo.getNpoSize());
        assertEquals("52998224725", savedNpo.getCpf());
        assertTrue(savedNpo.getEnvironmental());
        assertFalse(savedNpo.getSocial());
        assertFalse(savedNpo.getGovernance());

        Address savedAddress = addressCaptor.getValue();
        assertEquals("São Paulo", savedAddress.getCity());
        assertEquals("SP", savedAddress.getStateCode());

        verify(projectValidationService).validateFirstProject(request.firstProject());
        verify(projectService).createFirstProject(any(Npo.class), eq(request.firstProject()));

        assertEquals(10, response.userId());
        assertEquals(20, response.npoId());
        assertEquals(30L, response.projectId());
        assertEquals("contato@ong.org", response.email());
        assertTrue(response.accessReleased());
    }

    @Test
    @DisplayName("Deve bloquear login duplicado antes de salvar qualquer entidade")
    void shouldRejectDuplicateLogin() {
        NpoInstitutionalSignupRequest request = validRequest();
        when(usersRepository.existsByAuth0Id("auth0|npo")).thenReturn(false);
        when(usersRepository.existsByEmailIgnoreCase("contato@ong.org")).thenReturn(true);

        assertThrows(
                DuplicateLoginException.class,
                () ->
                        npoAccountService.registerInstitutionalAccount(
                                "auth0|npo", " Contato@ONG.org ", request));

        verify(usersRepository, never()).save(any());
        verify(npoService, never()).saveWithAddress(any(), any());
        verifyNoInteractions(npoDocumentService, npoEsgService);
    }

    @Test
    @DisplayName("O cadastro final deve ser transacional para manter Users + Npo atômicos")
    void shouldBeTransactional() throws NoSuchMethodException {
        assertNotNull(
                NpoAccountService.class
                        .getMethod(
                                "registerInstitutionalAccount",
                                String.class,
                                String.class,
                                NpoInstitutionalSignupRequest.class)
                        .getAnnotation(Transactional.class));
    }

    private static NpoInstitutionalSignupRequest validRequest() {
        return new NpoInstitutionalSignupRequest(
                "ONG Exemplo",
                " Contato@ONG.org ",
                "529.982.247-25",
                null,
                "pequena",
                "Resumo institucional",
                "(11) 99999-9999",
                true,
                false,
                false,
                new AddressSignupRequest(
                        "São Paulo", "SP", "São Paulo", "Rua A", "123", "Sala 1", "01000-000"),
                new NpoFirstProjectSignupRequest(
                        "Projeto Inicial",
                        "Descrição do projeto inicial",
                        new java.math.BigDecimal("1000.00"),
                        java.util.List.of("1")));
    }
}
