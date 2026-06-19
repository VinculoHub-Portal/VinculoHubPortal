/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.UserType;

public record CompanyProfileResponse(
        InstitutionalData institutionalData,
        ContactData contact,
        AddressData address,
        ResponsibleData responsible) {

    public record InstitutionalData(
            Integer id,
            String legalName,
            String socialName,
            String description,
            String logoUrl,
            String cnpj,
            String phone) {}

    public record ContactData(String email, String phone) {}

    public record AddressData(
            Integer id,
            String state,
            String stateCode,
            String city,
            String street,
            String number,
            String complement,
            String zipCode) {}

    public record ResponsibleData(
            Integer id, String name, String email, String auth0Id, UserType userType) {}
}
