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
import com.vinculohub.backend.model.enums.ProjectType;
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

    @Test
    @DisplayName("Deve lançar exceção para request nulo")
    void shouldRejectNullRequest() {
        assertThrows(
                IllegalArgumentException.class,
                () -> npoAccountService.registerInstitutionalAccount("auth0|npo", "a@b.com", null));
    }

    @Test
    @DisplayName("Deve bloquear auth0Id duplicado no primeiro check")
    void shouldRejectDuplicateAuth0Id() {
        NpoInstitutionalSignupRequest request = validRequest();
        when(userRepository.existsByAuth0Id("auth0|npo")).thenReturn(true);

        assertThrows(
                DuplicateLoginException.class,
                () -> npoAccountService.registerInstitutionalAccount("auth0|npo", "a@b.com", request));

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("findAllForExport delega para NpoService")
    void shouldDelegateExportToNpoService() {
        npoAccountService.findAllForExport();
        verify(npoService).findAllForExport();
    }

    @Test
    @DisplayName("Deve aceitar porte 'media' mapeando para NpoSize.medium")
    void shouldParseMediumNpoSize() {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG Media", "a@b.com", "529.982.247-25", null, "media",
                        "Desc", null, true, false, false,
                        new AddressSignupRequest(null, null, null, null, null, null, null),
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), any())).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|m", "a@b.com", request);

        assertNotNull(resp);
    }

    @Test
    @DisplayName("Deve lançar exceção para porte inválido")
    void shouldThrowForInvalidNpoSize() {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG X", "a@b.com", "529.982.247-25", null, "gigante",
                        "Desc", null, true, false, false,
                        new AddressSignupRequest(null, null, null, null, null, null, null),
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1);
            return u;
        });

        assertThrows(
                IllegalArgumentException.class,
                () -> npoAccountService.registerInstitutionalAccount("auth0|x", "a@b.com", request));
    }

    @Test
    @DisplayName("Deve aceitar porte 'grande' mapeando para NpoSize.large")
    void shouldParseLargeNpoSize() {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG Grande", "a@b.com", "529.982.247-25", null, "grande",
                        "Desc", null, true, false, false,
                        new AddressSignupRequest(null, null, null, null, null, null, null),
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), any())).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|g", "a@b.com", request);

        assertNotNull(resp);
    }

    @Test
    @DisplayName("Deve registrar com endereço nulo quando todos os campos do endereço são nulos")
    void shouldRegisterWithNullAddressWhenAllFieldsBlank() {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG Sem Endereço", "a@b.com", "529.982.247-25", null, "pequena",
                        "Desc", null, true, false, false,
                        new AddressSignupRequest("  ", "  ", "  ", "  ", "  ", "  ", "  "),
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), any())).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|nsa", "a@b.com", request);

        assertNotNull(resp);
        verify(npoService).saveWithAddress(any(), isNull());
    }

    @Test
    @DisplayName("Deve usar o email do request quando auth0Email é em branco")
    void shouldFallBackToRequestEmailWhenAuth0EmailIsBlank() {
        NpoInstitutionalSignupRequest request = validRequest();

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), any())).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        // auth0Email is blank → firstPresent returns request.email()
        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|npo", "   ", request);

        assertEquals("contato@ong.org", resp.email());
    }

    @Test
    @DisplayName("auth0Id em branco lança IllegalArgumentException via requireText")
    void shouldThrowWhenAuth0IdIsBlank() {
        NpoInstitutionalSignupRequest request = validRequest();
        assertThrows(IllegalArgumentException.class,
                () -> npoAccountService.registerInstitutionalAccount("   ", "a@b.com", request));
    }

    @Test
    @DisplayName("address nulo no request retorna null via toAddressOrNull")
    void shouldRegisterWithNullAddressRequest() {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG Sem Addr", "a@b.com", "529.982.247-25", null, "pequena",
                        "Desc", null, true, false, false,
                        null,
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), isNull())).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|x", "a@b.com", request);

        assertNotNull(resp);
        verify(npoService).saveWithAddress(any(), isNull());
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas stateCode é preenchido")
    void shouldDetectNonBlankWhenOnlyStateCodeFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, "SP", null, null, null, null, null));
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas city é preenchido")
    void shouldDetectNonBlankWhenOnlyCityFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, null, "São Paulo", null, null, null, null));
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas street é preenchido")
    void shouldDetectNonBlankWhenOnlyStreetFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, null, null, "Rua A", null, null, null));
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas number é preenchido")
    void shouldDetectNonBlankWhenOnlyNumberFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, null, null, null, "1", null, null));
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas complement é preenchido")
    void shouldDetectNonBlankWhenOnlyComplementFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, null, null, null, null, "Apto 2", null));
    }

    @Test
    @DisplayName("isBlankAddress retorna false quando apenas zipCode é preenchido")
    void shouldDetectNonBlankWhenOnlyZipCodeFilled() {
        assertIsBlankAddressFalse(new AddressSignupRequest(null, null, null, null, null, null, "01000-000"));
    }

    private void assertIsBlankAddressFalse(AddressSignupRequest addr) {
        NpoInstitutionalSignupRequest request =
                new NpoInstitutionalSignupRequest(
                        "ONG X", "a@b.com", "529.982.247-25", null, "pequena",
                        "Desc", null, true, false, false,
                        addr,
                        new NpoFirstProjectSignupRequest("P", "D", null, List.of("1"), ProjectType.SOCIAL_INVESTMENT_LAW));

        when(userRepository.existsByAuth0Id(any())).thenReturn(false);
        when(userRepository.existsByEmailIgnoreCase(any())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(inv -> { User u = inv.getArgument(0); u.setId(1); return u; });
        when(npoDocumentService.sanitizeCpf(any())).thenReturn("52998224725");
        when(npoDocumentService.sanitizeCnpj(any())).thenReturn(null);
        when(npoService.saveWithAddress(any(), any(Address.class))).thenAnswer(inv -> { Npo n = inv.getArgument(0); n.setId(2); return n; });
        when(projectService.createFirstProject(any(), any())).thenAnswer(inv -> { Project p = new Project(); p.setId(3L); return p; });

        NpoInstitutionalSignupResponse resp =
                npoAccountService.registerInstitutionalAccount("auth0|x", "a@b.com", request);

        assertNotNull(resp);
        verify(npoService).saveWithAddress(any(), any(Address.class));
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
                        List.of("1", "2"),
                        ProjectType.SOCIAL_INVESTMENT_LAW));
    }
}
