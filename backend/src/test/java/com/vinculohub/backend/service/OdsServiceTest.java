/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.dto.OdsResponse;
import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.repository.OdsRepository;
import java.util.List;
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
}
