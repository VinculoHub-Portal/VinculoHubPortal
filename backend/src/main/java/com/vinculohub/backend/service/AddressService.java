package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AddressDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.repository.AddressRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    public Optional<AddressDTO> findById(Integer id) {
        return addressRepository.findById(id).map(AddressDTO::from);
    }

    public AddressDTO createAddress(AddressDTO dto) {
        Address address = new Address();
        address.setState(dto.state());
        address.setStateCode(dto.stateCode());
        address.setCity(dto.city());
        address.setStreet(dto.street());
        address.setNumber(dto.number());
        address.setComplement(dto.complement());
        address.setZipCode(dto.zipCode());

        return AddressDTO.from(addressRepository.save(address));
    }

    public AddressDTO updateAddress(Integer id, AddressDTO dto) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));

        address.setState(dto.state());
        address.setStateCode(dto.stateCode());
        address.setCity(dto.city());
        address.setStreet(dto.street());
        address.setNumber(dto.number());
        address.setComplement(dto.complement());
        address.setZipCode(dto.zipCode());

        return AddressDTO.from(addressRepository.save(address));
    }

    public void deleteAddress(Integer id) {
        addressRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Address not found"));
        addressRepository.deleteById(id);
    }
}