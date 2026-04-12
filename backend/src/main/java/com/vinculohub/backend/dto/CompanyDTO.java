package com.vinculohub.backend.dto;

import lombok.Builder;

@Builder
public record CompanyDTO(
        Integer id,
        String legalName,
        String socialName,
        String description,
        String logoUrl,
        String cnpj,
        String phone,
        UsersDTO user,
        AddressDTO address
) {}