/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Npo;
import com.vinculohub.backend.model.enums.NpoSize;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.NpoRepository;
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
}
