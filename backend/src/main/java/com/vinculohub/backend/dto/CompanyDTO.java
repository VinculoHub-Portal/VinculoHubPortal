/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.Company;
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
        AddressDTO address) {

    public static CompanyDTO from(Company company) {
        return CompanyDTO.builder()
                .id(company.getId())
                .legalName(company.getLegalName())
                .socialName(company.getSocialName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .cnpj(company.getCnpj())
                .phone(company.getPhone())
                .user(company.getUser() != null ? UsersDTO.from(company.getUser()) : null)
                .address(
                        company.getAddress() != null
                                ? AddressDTO.from(company.getAddress())
                                : null)
                .build();
    }
}
