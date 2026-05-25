/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Document;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyProjectRepository;
import com.vinculohub.backend.repository.DocumentRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.ProjectRepository;
import com.vinculohub.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@ActiveProfiles("test")
class NpoProfileControllerTest extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;

    @Autowired private NpoRepository npoRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private CompanyProjectRepository companyProjectRepository;
    @Autowired private DocumentRepository documentRepository;
    @Autowired private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setup() {
        jdbcTemplate.update("DELETE FROM company_project");
        jdbcTemplate.update("DELETE FROM project_ods");
        jdbcTemplate.update("DELETE FROM document");
        jdbcTemplate.update("DELETE FROM project");
        jdbcTemplate.update("DELETE FROM npo");
        jdbcTemplate.update("DELETE FROM address");
        jdbcTemplate.update("DELETE FROM users");
    }

    @Test
    @DisplayName("GET /api/npos/{id} retorna 200 com perfil completo")
    void shouldReturn200WithFullProfile() throws Exception {
        User owner =
                userRepository.save(
                        User.builder()
                                .name("Owner")
                                .email("owner@ong.com")
                                .auth0Id("auth0|owner")
                                .userType(UserType.npo)
                                .build());

        Address address =
                addressRepository.save(
                        Address.builder()
                                .state("Rio Grande do Sul")
                                .stateCode("RS")
                                .city("Porto Alegre")
                                .street("Rua A")
                                .number("123")
                                .complement("Sala 1")
                                .zipCode("90000-000")
                                .build());

        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Teste Perfil")
                                .npoSize(NpoSize.small)
                                .phone("(11) 99999-0000")
                                .userId(owner.getId())
                                .address(address)
                                .description("Descrição ONG")
                                .build());

        Project project =
                projectRepository.save(
                        Project.builder().npo(npo).title("Projeto X").description("D").build());

        Document document = new Document();
        document.setNpo(npo);
        document.setProject(project);
        document.setTitle("Estatuto");
        document.setDescription("Estatuto social");
        document.setFileUrl("http://url");
        document.setFileName("estatuto.pdf");
        document.setFileSize(1234);
        document.setMimeType("application/pdf");
        documentRepository.save(document);

        var request =
                get("/api/npos/" + npo.getId())
                        .with(
                                jwt().authorities(new SimpleGrantedAuthority("ROLE_COMPANY"))
                                        .jwt(jwt -> jwt.subject("auth0|someone")));

        mockMvc.perform(request)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.institutionalData.name").value("ONG Teste Perfil"))
                .andExpect(jsonPath("$.contact.phone").value("(11) 99999-0000"))
                .andExpect(jsonPath("$.address.city").value("Porto Alegre"))
                .andExpect(jsonPath("$.projects[0].title").value("Projeto X"))
                .andExpect(jsonPath("$.documents[0].title").value("Estatuto"));
    }

    @Test
    @DisplayName("GET /api/npos/{id} retorna 404 para ONG inexistente")
    void shouldReturn404ForNonexistentNpo() throws Exception {
        mockMvc.perform(
                        get("/api/npos/999999")
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|someone"))))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/npos/{id} sem autenticação retorna 401")
    void shouldReturn401WithoutAuth() throws Exception {
        Npo npo =
                npoRepository.save(
                        Npo.builder().name("ONG Simples").npoSize(NpoSize.small).build());

        mockMvc.perform(get("/api/npos/" + npo.getId())).andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/npos/{id} retorna viewerContext OWNER quando autenticado como dono")
    void shouldReturnOwnerViewerContextWhenOwner() throws Exception {
        User owner =
                userRepository.save(
                        User.builder()
                                .name("Owner2")
                                .email("owner2@ong.com")
                                .auth0Id("auth0|owner2")
                                .userType(UserType.npo)
                                .build());

        Npo npo =
                npoRepository.save(
                        Npo.builder()
                                .name("ONG Dono")
                                .npoSize(NpoSize.small)
                                .userId(owner.getId())
                                .build());

        mockMvc.perform(
                        get("/api/npos/" + npo.getId())
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|owner2"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.viewerContext").value("OWNER"));
    }
}
