/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CompanyDTO(
        Integer id,
        @NotEmpty String legalName,
        @NotEmpty String socialName,
        String description,
        @NotEmpty String logoUrl,
        @NotEmpty String cnpj,
        @NotEmpty String phone,
        @NotNull @Valid UserDTO user,
        @NotNull @Valid AddressDTO address) {}
