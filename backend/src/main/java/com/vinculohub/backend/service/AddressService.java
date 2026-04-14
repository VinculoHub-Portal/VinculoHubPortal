/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AddressDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.repository.AddressRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public Address createAddress(AddressDTO dto) {
        Address address = new Address();
        address.setState(dto.state());
        address.setStateCode(dto.stateCode());
        address.setCity(dto.city());
        address.setStreet(dto.street());
        address.setNumber(dto.number());
        address.setComplement(dto.complement());
        address.setZipCode(dto.zipCode());

        return addressRepository.save(address);
    }

    public AddressDTO addressToAddressDTO(Address address) {
        return AddressDTO.builder()
                .id(address.getId())
                .state(address.getState())
                .stateCode(address.getStateCode())
                .city(address.getCity())
                .street(address.getStreet())
                .number(address.getNumber())
                .complement(address.getComplement())
                .zipCode(address.getZipCode())
                .build();
    }
}
