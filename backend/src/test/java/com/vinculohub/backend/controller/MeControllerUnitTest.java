/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.AuthenticatedProfileResponse;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class MeControllerUnitTest {

    @Mock private UserRepository userRepository;
    @Mock private NpoRepository npoRepository;
    @Mock private CompanyRepository companyRepository;

    private MeController meController;

    @BeforeEach
    void setUp() {
        meController = new MeController(userRepository, npoRepository, companyRepository);
    }

    private Jwt buildJwt(String sub, String email) {
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject(sub)
                .claim("email", email)
                .build();
    }

    @Test
    @DisplayName("profile retorna perfil vazio quando usuário não existe no banco")
    void shouldReturnEmptyProfileWhenUserNotFound() {
        when(userRepository.findByAuth0Id("auth0|missing")).thenReturn(Optional.empty());

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|missing", "m@m.com"));

        assertEquals("auth0|missing", result.auth0Id());
        assertEquals("m@m.com", result.email());
        assertNull(result.userId());
        assertNull(result.npoId());
        assertNull(result.companyId());
        assertFalse(result.registrationCompleted());
    }

    @Test
    @DisplayName("profile retorna npoId para usuário do tipo NPO")
    void shouldReturnNpoIdForNpoUser() {
        User user = User.builder().id(5).auth0Id("auth0|npo").email("n@n.com").userType(UserType.npo).build();
        Npo npo = Npo.builder().id(10).build();
        when(userRepository.findByAuth0Id("auth0|npo")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(5)).thenReturn(Optional.of(npo));

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|npo", "n@n.com"));

        assertEquals(10, result.npoId());
        assertNull(result.companyId());
        assertTrue(result.registrationCompleted());
    }

    @Test
    @DisplayName("profile retorna npoId nulo quando ONG não encontrada")
    void shouldReturnNullNpoIdWhenNpoNotRegistered() {
        User user = User.builder().id(5).auth0Id("auth0|npo2").email("n@n.com").userType(UserType.npo).build();
        when(userRepository.findByAuth0Id("auth0|npo2")).thenReturn(Optional.of(user));
        when(npoRepository.findByUserId(5)).thenReturn(Optional.empty());

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|npo2", "n@n.com"));

        assertNull(result.npoId());
        assertFalse(result.registrationCompleted());
    }

    @Test
    @DisplayName("profile usa nome fantasia quando não está em branco")
    void shouldUseSocialNameWhenNotBlank() {
        User user = User.builder().id(5).auth0Id("auth0|co").email("c@c.com").userType(UserType.company).build();
        Company company = new Company();
        company.setId(20);
        company.setSocialName("Fantasia S.A.");
        company.setLegalName("Razão Legal Ltda");
        when(userRepository.findByAuth0Id("auth0|co")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(5)).thenReturn(Optional.of(company));

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|co", "c@c.com"));

        assertEquals("Fantasia S.A.", result.companyName());
        assertEquals(20, result.companyId());
        assertTrue(result.registrationCompleted());
    }

    @Test
    @DisplayName("profile usa razão social quando nome fantasia é nulo")
    void shouldUseLegalNameWhenSocialNameIsNull() {
        User user = User.builder().id(5).auth0Id("auth0|co2").email("c@c.com").userType(UserType.company).build();
        Company company = new Company();
        company.setId(21);
        company.setSocialName(null);
        company.setLegalName("Razão Legal Ltda");
        when(userRepository.findByAuth0Id("auth0|co2")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(5)).thenReturn(Optional.of(company));

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|co2", "c@c.com"));

        assertEquals("Razão Legal Ltda", result.companyName());
    }

    @Test
    @DisplayName("profile usa razão social quando nome fantasia é em branco")
    void shouldUseLegalNameWhenSocialNameIsBlank() {
        User user = User.builder().id(5).auth0Id("auth0|co3").email("c@c.com").userType(UserType.company).build();
        Company company = new Company();
        company.setId(22);
        company.setSocialName("   ");
        company.setLegalName("Razão Legal Ltda");
        when(userRepository.findByAuth0Id("auth0|co3")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(5)).thenReturn(Optional.of(company));

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|co3", "c@c.com"));

        assertEquals("Razão Legal Ltda", result.companyName());
    }

    @Test
    @DisplayName("profile retorna companyId nulo quando empresa não encontrada para usuário company")
    void shouldReturnNullCompanyIdWhenCompanyNotFound() {
        User user = User.builder().id(5).auth0Id("auth0|co4").email("c@c.com").userType(UserType.company).build();
        when(userRepository.findByAuth0Id("auth0|co4")).thenReturn(Optional.of(user));
        when(companyRepository.findByUserId(5)).thenReturn(Optional.empty());

        AuthenticatedProfileResponse result = meController.profile(buildJwt("auth0|co4", "c@c.com"));

        assertNull(result.companyId());
        assertNull(result.companyName());
        assertFalse(result.registrationCompleted());
    }
}
