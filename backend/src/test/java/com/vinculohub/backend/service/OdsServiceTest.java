/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.repository.OdsRepository;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

@ExtendWith(MockitoExtension.class)
class OdsServiceTest {

    @Mock private OdsRepository odsRepository;

    @InjectMocks private OdsService odsService;

    @Test
    void shouldListOdsCatalogResponsesWithDescriptionsOrderedById() {
        when(odsRepository.findAll(Sort.by("id")))
                .thenReturn(
                        List.of(
                                Ods.builder()
                                        .id(1)
                                        .name("ODS 1 - Erradicação da Pobreza")
                                        .description(
                                                "Erradicar a pobreza em todas as formas, em todos"
                                                        + " os lugares.")
                                        .build()));

        List<OdsResponse> responses = odsService.listResponses();

        assertEquals(
                List.of(
                        new OdsResponse(
                                1,
                                "ODS 1 - Erradicação da Pobreza",
                                "Erradicar a pobreza em todas as formas, em todos os lugares.")),
                responses);
        verify(odsRepository).findAll(Sort.by("id"));
    }

    @Test
    @DisplayName("resolveSelection retorna ODS correspondentes para IDs válidos")
    void shouldResolveValidOdsSelection() {
        Ods ods1 = Ods.builder().id(1).name("ODS 1").build();
        Ods ods2 = Ods.builder().id(2).name("ODS 2").build();

        when(odsRepository.findAllById(any())).thenReturn(List.of(ods1, ods2));

        Set<Ods> result = odsService.resolveSelection(List.of("1", "2"));

        assertEquals(2, result.size());
        assertTrue(result.contains(ods1));
        assertTrue(result.contains(ods2));
    }

    @Test
    @DisplayName("resolveSelection lança exceção para lista nula")
    void shouldThrowForNullOdsList() {
        assertThrows(IllegalArgumentException.class, () -> odsService.resolveSelection(null));
    }

    @Test
    @DisplayName("resolveSelection lança exceção para lista vazia")
    void shouldThrowForEmptyOdsList() {
        assertThrows(IllegalArgumentException.class, () -> odsService.resolveSelection(List.of()));
    }

    @Test
    @DisplayName("resolveSelection lança exceção para valor em branco na lista")
    void shouldThrowForBlankOdsValue() {
        assertThrows(
                IllegalArgumentException.class, () -> odsService.resolveSelection(List.of("  ")));
    }

    @Test
    @DisplayName("resolveSelection lança exceção para valor não numérico")
    void shouldThrowForNonNumericOdsValue() {
        assertThrows(
                IllegalArgumentException.class, () -> odsService.resolveSelection(List.of("abc")));
    }

    @Test
    @DisplayName("resolveSelection lança exceção quando ODS não encontrado no banco")
    void shouldThrowWhenOdsNotFound() {
        when(odsRepository.findAllById(any())).thenReturn(List.of());

        assertThrows(
                IllegalArgumentException.class, () -> odsService.resolveSelection(List.of("99")));
    }
}
