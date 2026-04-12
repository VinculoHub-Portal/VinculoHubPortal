package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.AddressDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/address")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AddressController {

    private final AddressService addressService;

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressDTO> getAddressById(@PathVariable Integer addressId) {
        Optional<Address> addressOptional = addressService.findById(addressId);

        if (addressOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Address address = addressOptional.get();

        AddressDTO addressDTO = AddressDTO.builder()
                .id(address.getId())
                .state(address.getState())
                .stateCode(address.getStateCode())
                .city(address.getCity())
                .street(address.getStreet())
                .number(address.getNumber())
                .complement(address.getComplement())
                .zipCode(address.getZipCode())
                .build();

        return ResponseEntity.ok(addressDTO);
    }

    @PostMapping
    public ResponseEntity<AddressDTO> createAddress(@RequestBody AddressDTO addressDTO) {
        Address createdAddress = addressService.createAddress(addressDTO);

        AddressDTO responseDTO = AddressDTO.builder()
                .id(createdAddress.getId())
                .state(createdAddress.getState())
                .stateCode(createdAddress.getStateCode())
                .city(createdAddress.getCity())
                .street(createdAddress.getStreet())
                .number(createdAddress.getNumber())
                .complement(createdAddress.getComplement())
                .zipCode(createdAddress.getZipCode())
                .build();

        return ResponseEntity.status(201).body(responseDTO);
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Integer addressId,
                                                    @RequestBody AddressDTO addressDTO) {
        Address updatedAddress = addressService.updateAddress(addressId, addressDTO);

        AddressDTO responseDTO = AddressDTO.builder()
                .id(updatedAddress.getId())
                .state(updatedAddress.getState())
                .stateCode(updatedAddress.getStateCode())
                .city(updatedAddress.getCity())
                .street(updatedAddress.getStreet())
                .number(updatedAddress.getNumber())
                .complement(updatedAddress.getComplement())
                .zipCode(updatedAddress.getZipCode())
                .build();

        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Integer addressId) {
        addressService.deleteAddress(addressId);
        return ResponseEntity.noContent().build();
    }
}