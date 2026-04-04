/* (C)2026 */
package com.vinculohub.backend.dto;

public record CepResponseDto(
        String zipCode,
        String street,
        String complement,
        String city,
        String stateCode,
        String state) {

    public static CepResponseDto from(CepRawResponseDto raw) {
        return new CepResponseDto(
                raw.zipCode(),
                raw.street(),
                raw.complement(),
                raw.city(),
                raw.stateCode(),
                raw.state());
    }
}
