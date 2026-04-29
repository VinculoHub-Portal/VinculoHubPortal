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
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
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

    @Mock private UserRepository userRepository;

    @Mock private NpoService npoService;

    @Mock private ProjectValidationService projectValidationService;

    @Mock private ProjectService projectService;

    @Mock private NpoDocumentService npoDocumentService;

    @Mock private NpoEsgService npoEsgService;

    @InjectMocks private NpoAccountService npoAccountService;

    @Test
    @DisplayName("Deve registrar User + Npo na mesma operação transacional")
    void shouldRegisterUserAndNpoAccount() {
        NpoInstitutionalSignupRequest request = validRequest();

        when(userRepository.existsByAuth0Id("auth0|npo")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("contato@ong.org")).thenReturn(false);
        when(userRepository.save(any(User.class)))
                .thenAnswer(
                        invocation -> {
                            User user = invocation.getArgument(0);
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
                            Project project = new Project();
                            project.setId(30L);
                            return project;
                        });

        NpoInstitutionalSignupResponse response =
                npoAccountService.registerInstitutionalAccount(
                        "auth0|npo", " Contato@ONG.org ", request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        ArgumentCaptor<Npo> npoCaptor = ArgumentCaptor.forClass(Npo.class);
        ArgumentCaptor<Address> addressCaptor = ArgumentCaptor.forClass(Address.class);
        ArgumentCaptor<NpoFirstProjectSignupRequest> projectRequestCaptor =
                ArgumentCaptor.forClass(NpoFirstProjectSignupRequest.class);

        verify(userRepository).save(userCaptor.capture());
        verify(npoService).saveWithAddress(npoCaptor.capture(), addressCaptor.capture());
        verify(projectValidationService).validateFirstProject(projectRequestCaptor.capture());
        verify(projectService)
                .createFirstProject(eq(npoCaptor.getValue()), eq(request.firstProject()));
        verify(npoDocumentService).validateDocuments("529.982.247-25", null);
        verify(npoEsgService).validateEsgSelection(true, false, false);

        User savedUser = userCaptor.getValue();
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

        assertEquals(10, response.userId());
        assertEquals(20, response.npoId());
        assertEquals(30L, response.projectId());
        assertEquals("contato@ong.org", response.email());
        assertTrue(response.accessReleased());

        NpoFirstProjectSignupRequest savedProjectRequest = projectRequestCaptor.getValue();
        assertEquals("Projeto Inicial", savedProjectRequest.name());
        assertEquals("Projeto piloto", savedProjectRequest.description());
        assertEquals(new BigDecimal("1000.00"), savedProjectRequest.capital());
        assertEquals(List.of("1", "2"), savedProjectRequest.ods());
    }

    @Test
    @DisplayName("Deve bloquear login duplicado antes de salvar qualquer entidade")
    void shouldRejectDuplicateLogin() {
        NpoInstitutionalSignupRequest request = validRequest();
        when(userRepository.existsByAuth0Id("auth0|npo")).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase("contato@ong.org")).thenReturn(true);

        assertThrows(
                DuplicateLoginException.class,
                () ->
                        npoAccountService.registerInstitutionalAccount(
                                "auth0|npo", " Contato@ONG.org ", request));

        verify(userRepository, never()).save(any());
        verify(npoService, never()).saveWithAddress(any(), any());
        verifyNoInteractions(npoDocumentService, npoEsgService);
    }

    @Test
    @DisplayName("O cadastro final deve ser transacional para manter User + Npo atômicos")
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
                        "Projeto piloto",
                        new BigDecimal("1000.00"),
                        List.of("1", "2")));
    }
}
