/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CompanyDTO(
        Integer id,
        @NotBlank String legalName,
        @NotBlank String socialName,
        String description,
        String logoUrl,
        @NotBlank String cnpj,
        String phone,
        @NotNull @Valid UserDTO user,
        @NotNull @Valid AddressDTO address) {}
