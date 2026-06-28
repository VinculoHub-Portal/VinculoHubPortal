/* (C)2026 */
package com.vinculohub.backend.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.vinculohub.backend.dto.AddressDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.repository.AddressRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AddressServiceTest {

    @Mock private AddressRepository addressRepository;

    @InjectMocks private AddressService addressService;

    @Test
    @DisplayName("Deve criar Address a partir de DTO e persistir")
    void shouldCreateAddressFromDto() {
        AddressDTO dto =
                AddressDTO.builder()
                        .state("São Paulo")
                        .stateCode("SP")
                        .city("São Paulo")
                        .street("Avenida Paulista")
                        .number("1000")
                        .complement("Sala 10")
                        .zipCode("01310-100")
                        .build();

        Address saved =
                Address.builder()
                        .id(99)
                        .state("São Paulo")
                        .stateCode("SP")
                        .city("São Paulo")
                        .street("Avenida Paulista")
                        .number("1000")
                        .complement("Sala 10")
                        .zipCode("01310-100")
                        .build();

        when(addressRepository.save(any(Address.class))).thenReturn(saved);

        Address result = addressService.createAddress(dto);

        ArgumentCaptor<Address> captor = ArgumentCaptor.forClass(Address.class);
        verify(addressRepository).save(captor.capture());

        Address captured = captor.getValue();
        assertEquals("São Paulo", captured.getState());
        assertEquals("SP", captured.getStateCode());
        assertEquals("São Paulo", captured.getCity());
        assertEquals("Avenida Paulista", captured.getStreet());
        assertEquals("1000", captured.getNumber());
        assertEquals("Sala 10", captured.getComplement());
        assertEquals("01310-100", captured.getZipCode());

        assertSame(saved, result);
    }

    @Test
    @DisplayName("Deve converter Address para DTO com todos os campos")
    void shouldConvertAddressToDto() {
        Address address =
                Address.builder()
                        .id(5)
                        .state("Rio de Janeiro")
                        .stateCode("RJ")
                        .city("Niterói")
                        .street("Rua B")
                        .number("200")
                        .complement("Apto 3")
                        .zipCode("24000-000")
                        .build();

        AddressDTO dto = addressService.addressToAddressDTO(address);

        assertEquals(5, dto.id());
        assertEquals("Rio de Janeiro", dto.state());
        assertEquals("RJ", dto.stateCode());
        assertEquals("Niterói", dto.city());
        assertEquals("Rua B", dto.street());
        assertEquals("200", dto.number());
        assertEquals("Apto 3", dto.complement());
        assertEquals("24000-000", dto.zipCode());
    }

    @Test
    @DisplayName("Deve converter Address com campos nulos para DTO")
    void shouldConvertAddressWithNullsToDto() {
        Address address = Address.builder().id(7).city("Porto Alegre").stateCode("RS").build();

        AddressDTO dto = addressService.addressToAddressDTO(address);

        assertEquals(7, dto.id());
        assertEquals("Porto Alegre", dto.city());
        assertEquals("RS", dto.stateCode());
        assertNull(dto.street());
        assertNull(dto.number());
        assertNull(dto.complement());
    }
}
