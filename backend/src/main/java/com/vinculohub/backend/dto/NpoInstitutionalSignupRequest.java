/* (C)2026 */
package com.vinculohub.backend.dto;

public record NpoInstitutionalSignupRequest(
        String name,
        String email,
        String cpf,
        String cnpj,
        String npoSize,
        String description,
        String phone,
        Boolean environmental,
        Boolean social,
        Boolean governance,
        AddressSignupRequest address) {}
