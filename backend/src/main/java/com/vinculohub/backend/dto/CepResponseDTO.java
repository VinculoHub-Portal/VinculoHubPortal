package com.vinculohub.backend.dto;

public record CepResponseDTO(
        String zipCode,
        String street,
        String complement,
        String city,
        String stateCode,
        String state) {

    public static CepResponseDTO from(CepRawResponseDTO raw) {
        return new CepResponseDTO(
                raw.zipCode(),
                raw.street(),
                raw.complement(),
                raw.city(),
                raw.stateCode(),
                raw.state());
    }
}