/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.exception.CompanyAlreadyExistsException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.CompanyRepository;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AddressService addressService;
    private final UsersService usersService;

    @Transactional
    public CompanyDTO createCompany(CompanyDTO companyDTO) {
        if (companyRepository.existsByCnpj(companyDTO.cnpj())) {
            throw new CompanyAlreadyExistsException();
        }

        Company company = new Company();
        company.setLegalName(companyDTO.legalName());
        company.setSocialName(companyDTO.socialName());
        company.setDescription(companyDTO.description());
        company.setLogoUrl(companyDTO.logoUrl());
        company.setCnpj(companyDTO.cnpj());
        company.setPhone(companyDTO.phone());

        Address address = addressService.createAddress(companyDTO.address());

        company.setAddress(address);

        Users user = usersService.createUser(companyDTO.user());

        company.setUser(user);

        return companyToCompanyDTO(companyRepository.save(company));
    }

    public CompanyDTO companyToCompanyDTO(Company company) {
        return CompanyDTO.builder()
                .id(company.getId())
                .legalName(company.getLegalName())
                .socialName(company.getSocialName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .cnpj(company.getCnpj())
                .phone(company.getPhone())
                .address(addressService.addressToAddressDTO(company.getAddress()))
                .user(usersService.userToUserDTO(company.getUser()))
                .build();
    }
}
