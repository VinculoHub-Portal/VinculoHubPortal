/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Builder;

@Builder
public record AddressDTO(
        Integer id,
        @NotEmpty String state,
        @NotEmpty String stateCode,
        @NotEmpty String city,
        @NotEmpty String street,
        @NotEmpty String number,
        String complement,
        @NotEmpty String zipCode) {}
