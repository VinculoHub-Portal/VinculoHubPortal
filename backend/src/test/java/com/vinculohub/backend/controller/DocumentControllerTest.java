/* (C)2026 */
package com.vinculohub.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.vinculohub.backend.config.SecurityConfig;
import com.vinculohub.backend.dto.DocumentRequestDTO;
import com.vinculohub.backend.dto.DocumentResponseDTO;
import com.vinculohub.backend.service.DocumentService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = DocumentController.class)
@Import({SecurityConfig.class, DocumentControllerTest.JwtDecoderTestConfig.class})
@TestPropertySource(
        properties = {
            "app.frontend.url=http://localhost:5173",
            "app.auth0.roles-claim=https://vinculohub/roles"
        })
class DocumentControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private DocumentService documentService;

    @Test
    @DisplayName("POST /api/documents usa o JWT para upload de ONG autenticada")
    void shouldUploadDocumentUsingAuthenticatedJwtSubject() throws Exception {
        DocumentResponseDTO response = new DocumentResponseDTO();
        response.setId(10);
        response.setNpoId(42);
        response.setTitle("Estatuto");
        response.setFileUrl("https://example.com/file.pdf");
        response.setFileName("estatuto.pdf");
        response.setFileSize(1024);
        response.setMimeType("application/pdf");

        when(documentService.upload(any(), any(), any())).thenReturn(response);

        MockMultipartFile file =
                new MockMultipartFile(
                        "file", "estatuto.pdf", "application/pdf", "conteudo".getBytes());
        MockMultipartFile data =
                new MockMultipartFile(
                        "data",
                        "",
                        "application/json",
                        """
                        {"npoId":999,"title":"Estatuto","description":"Documento"}
                        """
                                .getBytes());

        mockMvc.perform(
                        multipart("/api/documents")
                                .file(file)
                                .file(data)
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|npo-owner"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.npoId").value(42))
                .andExpect(jsonPath("$.title").value("Estatuto"));

        verify(documentService).upload(eq("auth0|npo-owner"), any(), any(DocumentRequestDTO.class));
    }

    @Test
    @DisplayName("POST /api/documents bloqueia usuario que nao e ONG")
    void shouldRejectUploadForNonNpoRole() throws Exception {
        MockMultipartFile file =
                new MockMultipartFile(
                        "file", "estatuto.pdf", "application/pdf", "conteudo".getBytes());
        MockMultipartFile data =
                new MockMultipartFile(
                        "data",
                        "",
                        "application/json",
                        "{\"title\":\"Estatuto\",\"description\":\"Documento\"}".getBytes());

        mockMvc.perform(
                        multipart("/api/documents")
                                .file(file)
                                .file(data)
                                .with(
                                        jwt().authorities(
                                                        new SimpleGrantedAuthority("ROLE_COMPANY"))
                                                .jwt(jwt -> jwt.subject("auth0|company"))))
                .andExpect(status().isForbidden());

        verify(documentService, never()).upload(any(), any(), any());
    }

    @Test
    @DisplayName("GET /api/documents ignora npoId da query e filtra pela ONG autenticada")
    void shouldListOnlyAuthenticatedNpoDocuments() throws Exception {
        DocumentResponseDTO response = new DocumentResponseDTO();
        response.setId(10);
        response.setNpoId(42);
        response.setProjectId(7);
        response.setTitle("Estatuto");

        when(documentService.findAllByAuthenticatedNpo("auth0|npo-owner", 7))
                .thenReturn(List.of(response));

        mockMvc.perform(
                        get("/api/documents")
                                .param("npoId", "999")
                                .param("projectId", "7")
                                .with(
                                        jwt().authorities(new SimpleGrantedAuthority("ROLE_NPO"))
                                                .jwt(jwt -> jwt.subject("auth0|npo-owner"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(10))
                .andExpect(jsonPath("$[0].npoId").value(42))
                .andExpect(jsonPath("$[0].projectId").value(7));

        verify(documentService).findAllByAuthenticatedNpo("auth0|npo-owner", 7);
    }

    @TestConfiguration
    static class JwtDecoderTestConfig {
        @Bean
        JwtDecoder jwtDecoder() {
            return mock(JwtDecoder.class);
        }
    }
}
