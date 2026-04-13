/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.dto.CompanyRegistrationDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.UserType;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UsersRepository;
import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AddressRepository addressRepository;
    private final UsersRepository usersRepository;

    public Optional<CompanyDTO> findById(Integer id) {
        return companyRepository.findById(id).map(CompanyDTO::from);
    }

    public CompanyDTO createCompany(CompanyDTO dto) {
        Company company = new Company();
        company.setLegalName(dto.legalName());
        company.setSocialName(dto.socialName());
        company.setDescription(dto.description());
        company.setLogoUrl(dto.logoUrl());
        company.setCnpj(dto.cnpj());
        company.setPhone(dto.phone());

        if (dto.address() != null) {
            Address address =
                    addressRepository
                            .findById(dto.address().id())
                            .orElseThrow(() -> new EntityNotFoundException("Address not found"));
            company.setAddress(address);
        }

        if (dto.user() != null) {
            Users user =
                    usersRepository
                            .findById(dto.user().id())
                            .orElseThrow(() -> new EntityNotFoundException("User not found"));
            company.setUser(user);
        }

        return CompanyDTO.from(companyRepository.save(company));
    }

    public CompanyDTO updateCompany(Integer id, CompanyDTO dto) {
        Company company =
                companyRepository
                        .findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        company.setLegalName(dto.legalName());
        company.setSocialName(dto.socialName());
        company.setDescription(dto.description());
        company.setLogoUrl(dto.logoUrl());
        company.setCnpj(dto.cnpj());
        company.setPhone(dto.phone());

        if (dto.address() != null) {
            Address address =
                    addressRepository
                            .findById(dto.address().id())
                            .orElseThrow(() -> new EntityNotFoundException("Address not found"));
            company.setAddress(address);
        }

        if (dto.user() != null) {
            Users user =
                    usersRepository
                            .findById(dto.user().id())
                            .orElseThrow(() -> new EntityNotFoundException("User not found"));
            company.setUser(user);
        }

        return CompanyDTO.from(companyRepository.save(company));
    }

    public void deleteCompany(Integer id) {
        companyRepository
                .findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
        companyRepository.deleteById(id);
    }

    @Transactional
    public CompanyDTO registerCompany(CompanyRegistrationDTO dto) {
        LocalDateTime now = LocalDateTime.now();

        Address address = new Address();
        address.setZipCode(dto.zipCode());
        address.setStreet(dto.street());
        address.setNumber(dto.number());
        address.setComplement(dto.complement());
        address.setCity(dto.city());
        address.setState(dto.state());
        address.setStateCode(dto.stateCode());
        address.setCreatedAt(now);
        Address savedAddress = addressRepository.save(address);

        Users user = new Users();
        user.setEmail(dto.email());
        user.setUserType(UserType.company);
        user.setCreatedAt(now);
        Users savedUser = usersRepository.save(user);

        Company company = new Company();
        company.setLegalName(dto.legalName());
        company.setSocialName(dto.socialName());
        company.setDescription(dto.description());
        company.setCnpj(dto.cnpj());
        company.setPhone(dto.phone());
        company.setAddress(savedAddress);
        company.setUser(savedUser);
        company.setCreatedAt(now);

        return CompanyDTO.from(companyRepository.save(company));
    }
}
