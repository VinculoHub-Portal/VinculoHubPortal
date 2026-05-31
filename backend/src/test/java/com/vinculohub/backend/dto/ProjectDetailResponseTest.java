/* (C)2026 */
package com.vinculohub.backend.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.Project;
import com.vinculohub.backend.model.enums.ProjectStatus;
import com.vinculohub.backend.model.enums.ProjectType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ProjectDetailResponseTest {

    @Test
    @DisplayName("Deve retornar o detalhe do projeto com dados completos da ONG")
    void shouldMapProjectWithFullNpoData() {
        Address address = Address.builder().city("São Paulo").stateCode("SP").build();

        Npo npo =
                Npo.builder()
                        .id(7)
                        .name("ONG Esperança")
                        .logoUrl("http://logo.com/img.png")
                        .description("Descrição da ONG")
                        .address(address)
                        .build();

        Project project =
                Project.builder()
                        .id(1L)
                        .title("Projeto Teste")
                        .description("Descrição do projeto")
                        .status(ProjectStatus.ACTIVE)
                        .type(ProjectType.SOCIAL_INVESTMENT_LAW)
                        .budgetNeeded(new BigDecimal("1000"))
                        .npo(npo)
                        .build();

        List<OdsResponse> odsList = List.of(new OdsResponse(1, "ODS 1", "Desc 1"));

        ProjectDetailResponse response = ProjectDetailResponse.from(project, odsList);

        assertNotNull(response.responsibleInstitution());
        assertEquals(Integer.valueOf(7), response.responsibleInstitution().npoId());
        assertEquals("ONG Esperança", response.responsibleInstitution().name());
        assertEquals("http://logo.com/img.png", response.responsibleInstitution().logoUrl());
        assertEquals("São Paulo", response.responsibleInstitution().city());
        assertEquals("SP", response.responsibleInstitution().stateCode());
        assertEquals("Descrição da ONG", response.responsibleInstitution().description());
        assertEquals(1L, response.id());
        assertEquals("Projeto Teste", response.title());
        assertEquals(1, response.ods().size());
    }

    @Test
    @DisplayName("Deve mapear corretamente quando a ONG não possuir logo cadastrada")
    void shouldMapProjectWhenNpoHasNoLogo() {
        Address address = Address.builder().city("Rio de Janeiro").stateCode("RJ").build();

        Npo npo =
                Npo.builder()
                        .name("ONG Sem Logo")
                        .description("Descrição da ONG")
                        .address(address)
                        .logoUrl(null)
                        .build();

        Project project = Project.builder().id(2L).npo(npo).build();

        ProjectDetailResponse response = ProjectDetailResponse.from(project, List.of());

        assertNotNull(response.responsibleInstitution());
        assertNull(response.responsibleInstitution().logoUrl());
        assertEquals("ONG Sem Logo", response.responsibleInstitution().name());
        assertEquals("Rio de Janeiro", response.responsibleInstitution().city());
    }

    @Test
    @DisplayName("Deve mapear corretamente quando a ONG não possuir endereço cadastrado")
    void shouldMapProjectWhenNpoHasNoAddress() {
        Npo npo =
                Npo.builder()
                        .name("ONG Sem Endereço")
                        .logoUrl("http://logo.com/img.png")
                        .address(null)
                        .build();

        Project project = Project.builder().id(3L).npo(npo).build();

        ProjectDetailResponse response = ProjectDetailResponse.from(project, List.of());

        assertNotNull(response.responsibleInstitution());
        assertNull(response.responsibleInstitution().city());
        assertNull(response.responsibleInstitution().stateCode());
        assertEquals("ONG Sem Endereço", response.responsibleInstitution().name());
    }

    @Test
    @DisplayName("Deve garantir que dados sensíveis da ONG não são retornados na resposta")
    void shouldNotIncludeSensitiveData() {
        Npo npo =
                Npo.builder()
                        .name("ONG Segura")
                        .description("Descrição Segura")
                        .cnpj("12.345.678/0001-90")
                        .cpf("123.456.789-00")
                        .phone("(11) 99999-9999")
                        .userId(99)
                        .build();

        Project project = Project.builder().id(4L).npo(npo).build();

        ProjectDetailResponse response = ProjectDetailResponse.from(project, List.of());

        assertNotNull(response.responsibleInstitution());
        assertEquals("ONG Segura", response.responsibleInstitution().name());
        assertThrows(
                NoSuchMethodException.class,
                () -> ProjectResponsibleInstitutionResponse.class.getMethod("cnpj"));
        assertThrows(
                NoSuchMethodException.class,
                () -> ProjectResponsibleInstitutionResponse.class.getMethod("cpf"));
        assertThrows(
                NoSuchMethodException.class,
                () -> ProjectResponsibleInstitutionResponse.class.getMethod("phone"));
        assertThrows(
                NoSuchMethodException.class,
                () -> ProjectResponsibleInstitutionResponse.class.getMethod("userId"));
    }
}
