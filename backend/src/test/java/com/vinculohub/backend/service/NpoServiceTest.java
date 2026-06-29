/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.NpoExportDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.NpoRepository;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NpoServiceTest {

    @Mock private NpoRepository npoRepository;

    @Mock private AddressRepository addressRepository;

    @InjectMocks private NpoService npoService;

    @Test
    @DisplayName("Deve salvar endereço primeiro e depois a ONG com o vínculo configurado")
    void shouldSaveAddressBeforeNpo() {
        Address address = Address.builder().street("Rua A").city("São Paulo").build();
        Address savedAddress = Address.builder().id(10).street("Rua A").city("São Paulo").build();
        Npo npo =
                Npo.builder()
                        .name("ONG Exemplo")
                        .npoSize(NpoSize.small)
                        .environmental(true)
                        .build();

        when(addressRepository.save(address)).thenReturn(savedAddress);
        when(npoRepository.save(any(Npo.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Npo result = npoService.saveWithAddress(npo, address);

        InOrder inOrder = inOrder(addressRepository, npoRepository);
        inOrder.verify(addressRepository).save(address);
        inOrder.verify(npoRepository).save(npo);

        assertSame(savedAddress, result.getAddress());
        verifyNoMoreInteractions(addressRepository, npoRepository);
    }

    @Test
    @DisplayName("Deve salvar ONG sem endereço quando o endereço não for informado")
    void shouldSaveNpoWithoutAddress() {
        Npo npo =
                Npo.builder().name("ONG Sem Endereço").npoSize(NpoSize.medium).social(true).build();

        when(npoRepository.save(npo)).thenReturn(npo);

        Npo result = npoService.saveWithAddress(npo, null);

        verifyNoInteractions(addressRepository);
        verify(npoRepository).save(npo);
        assertNull(result.getAddress());
    }

    @Test
    @DisplayName("Deve rejeitar ONG nula")
    void shouldRejectNullNpo() {
        IllegalArgumentException ex =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> npoService.saveWithAddress(null, null));
        assertTrue(ex.getMessage().contains("ONG"));
    }

    @Test
    @DisplayName("Deve exportar lista de ONGs com endereço")
    void shouldExportAllNposWithAddress() {
        Address address =
                Address.builder()
                        .city("Porto Alegre")
                        .state("Rio Grande do Sul")
                        .zipCode("90000-000")
                        .build();
        Npo npo =
                Npo.builder()
                        .id(1)
                        .name("ONG Exemplo")
                        .cnpj("12345678000199")
                        .npoSize(NpoSize.small)
                        .environmental(true)
                        .social(false)
                        .governance(true)
                        .address(address)
                        .build();

        when(npoRepository.findAll()).thenReturn(List.of(npo));

        List<NpoExportDTO> result = npoService.findAllForExport();

        assertEquals(1, result.size());
        NpoExportDTO dto = result.get(0);
        assertEquals(1, dto.id());
        assertEquals("ONG Exemplo", dto.name());
        assertEquals("Porto Alegre", dto.city());
        assertEquals("Rio Grande do Sul", dto.state());
        assertTrue(dto.environmental());
        assertFalse(dto.social());
    }

    @Test
    @DisplayName("Deve exportar ONG sem endereço mapeando campos como null")
    void shouldExportNpoWithNullAddress() {
        Npo npo =
                Npo.builder()
                        .id(2)
                        .name("ONG Sem End")
                        .npoSize(NpoSize.medium)
                        .address(null)
                        .build();

        when(npoRepository.findAll()).thenReturn(List.of(npo));

        List<NpoExportDTO> result = npoService.findAllForExport();

        NpoExportDTO dto = result.get(0);
        assertNull(dto.city());
        assertNull(dto.state());
        assertNull(dto.zipCode());
    }
}
