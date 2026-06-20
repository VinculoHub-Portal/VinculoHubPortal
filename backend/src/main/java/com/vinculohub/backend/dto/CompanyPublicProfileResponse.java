/* (C)2026 */
package com.vinculohub.backend.dto;

public record CompanyPublicProfileResponse(
        Integer id,
        String legalName,
        String socialName,
        String description,
        String logoUrl,
        String cnpj,
        String city,
        String state,
        String stateCode,
        String street,
        String number,
        String complement,
        String zipCode,
        String segment,
        String website) {}
