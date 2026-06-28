/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.AdminNpoCardResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.projection.AdminNpoCardProjection;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

@ExtendWith(MockitoExtension.class)
class AdminNpoServiceTest {

    @Mock private NpoRepository npoRepository;

    @InjectMocks private AdminNpoService adminNpoService;

    @Test
    @DisplayName("Deve listar ONGs com todos os filtros nulos")
    void shouldListNposWithAllNullFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        AdminNpoCardProjection projection = buildProjection(1, "ONG Alfa", true, true, false, false, "SP");

        when(npoRepository.findAdminCards(null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(projection), pageable, 1));

        Page<AdminNpoCardResponse> result = adminNpoService.listNpos(null, null, null, pageable);

        assertEquals(1, result.getTotalElements());
        AdminNpoCardResponse resp = result.getContent().get(0);
        assertEquals(1, resp.id());
        assertEquals("ONG Alfa", resp.name());
        assertTrue(resp.active());
        assertTrue(resp.environmental());
        assertFalse(resp.social());
        assertFalse(resp.governance());
    }

    @Test
    @DisplayName("Deve normalizar area 'all' para null")
    void shouldNormalizeAreaAllToNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos(null, "all", null, pageable);

        verify(npoRepository).findAdminCards(null, null, null, pageable);
    }

    @Test
    @DisplayName("Deve aceitar area 'environmental'")
    void shouldAcceptEnvironmentalArea() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, "environmental", null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos(null, "ENVIRONMENTAL", null, pageable);

        verify(npoRepository).findAdminCards(null, "environmental", null, pageable);
    }

    @Test
    @DisplayName("Deve aceitar area 'social'")
    void shouldAcceptSocialArea() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, "social", null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos(null, "Social", null, pageable);

        verify(npoRepository).findAdminCards(null, "social", null, pageable);
    }

    @Test
    @DisplayName("Deve aceitar area 'governance'")
    void shouldAcceptGovernanceArea() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, "governance", null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos(null, "governance", null, pageable);

        verify(npoRepository).findAdminCards(null, "governance", null, pageable);
    }

    @Test
    @DisplayName("Deve lançar BadRequestException para área inválida")
    void shouldThrowForInvalidArea() {
        Pageable pageable = PageRequest.of(0, 10);

        assertThrows(
                BadRequestException.class,
                () -> adminNpoService.listNpos(null, "invalid_area", null, pageable));

        verifyNoInteractions(npoRepository);
    }

    @Test
    @DisplayName("Deve normalizar busca: trim e tratar string vazia como null")
    void shouldTrimSearchAndConvertBlankToNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos("   ", null, null, pageable);

        verify(npoRepository).findAdminCards(null, null, null, pageable);
    }

    @Test
    @DisplayName("Deve normalizar busca com texto real")
    void shouldTrimSearchWithRealText() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards("verde", null, true, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos("  verde  ", null, true, pageable);

        verify(npoRepository).findAdminCards("verde", null, true, pageable);
    }

    @Test
    @DisplayName("Deve mapear projection com flags boolean null como false")
    void shouldMapNullBooleanFlagsAsFalse() {
        Pageable pageable = PageRequest.of(0, 10);
        AdminNpoCardProjection projection = buildProjection(5, "ONG Beta", null, null, null, null, "RJ");

        when(npoRepository.findAdminCards(null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(projection), pageable, 1));

        AdminNpoCardResponse resp = adminNpoService.listNpos(null, null, null, pageable).getContent().get(0);

        assertFalse(resp.active());
        assertFalse(resp.environmental());
        assertFalse(resp.social());
        assertFalse(resp.governance());
    }

    @Test
    @DisplayName("Deve tratar area null como null (sem filtro)")
    void shouldTreatNullAreaAsNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(npoRepository.findAdminCards(null, null, null, pageable))
                .thenReturn(new PageImpl<>(List.of(), pageable, 0));

        adminNpoService.listNpos(null, null, null, pageable);

        verify(npoRepository).findAdminCards(null, null, null, pageable);
    }

    private AdminNpoCardProjection buildProjection(
            Integer id,
            String name,
            Boolean active,
            Boolean environmental,
            Boolean social,
            Boolean governance,
            String stateCode) {
        return new AdminNpoCardProjection() {
            @Override public Integer getId() { return id; }
            @Override public String getName() { return name; }
            @Override public String getLogoUrl() { return null; }
            @Override public Boolean getActive() { return active; }
            @Override public Boolean getEnvironmental() { return environmental; }
            @Override public Boolean getSocial() { return social; }
            @Override public Boolean getGovernance() { return governance; }
            @Override public String getCity() { return "Cidade"; }
            @Override public String getStateCode() { return stateCode; }
            @Override public LocalDateTime getCreatedAt() { return LocalDateTime.now(); }
        };
    }
}
