/* (C)2026 */
package com.vinculohub.backend.dto;

public record CompanyRegistrationDTO(
        String cnpj,
        String legalName,
        String socialName,
        String description,
        String zipCode,
        String street,
        String number,
        String complement,
        String city,
        String state,
        String stateCode,
        String phone,
        String email) {}
