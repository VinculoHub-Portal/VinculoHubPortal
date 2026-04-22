/* (C)2026 */
package com.vinculohub.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record CompanyDTO(
        @NotBlank Integer id,
        @NotBlank String legalName,
        @NotBlank String socialName,
        @NotNull String description,
        @NotBlank String logoUrl,
        @NotBlank String cnpj,
        @NotBlank String phone,
        @NotBlank @Valid UserDTO user,
        @NotBlank @Valid AddressDTO address) {}
