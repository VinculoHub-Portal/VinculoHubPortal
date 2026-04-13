package com.vinculohub.backend.dto;

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
        String zipCode
) {}