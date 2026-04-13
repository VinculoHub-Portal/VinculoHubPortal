/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Address;
import lombok.Builder;

@Builder
public record AddressDTO(
        Integer id,
        String state,
        String stateCode,
        String city,
        String street,
        String number,
        String complement,
        String zipCode) {

    public static AddressDTO from(Address address) {
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
