/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.dto.UserDTO;
import com.vinculohub.backend.exception.CompanyAlreadyExistsException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final AddressService addressService;
    private final UserRepository userRepository;

    @Transactional
    public CompanyDTO createCompany(String auth0Id, String auth0Email, CompanyDTO companyDTO) {
        log.info("Creating company | auth0Id={} email={} cnpj={}", auth0Id, auth0Email, companyDTO.cnpj());

        if (auth0Id == null || auth0Id.isBlank()) {
            log.error("Auth0 ID is blank");
            throw new IllegalArgumentException("Auth0 ID e obrigatorio.");
        }

        if (companyRepository.existsByCnpj(companyDTO.cnpj())) {
            log.warn("Duplicate CNPJ: {}", companyDTO.cnpj());
            throw new CompanyAlreadyExistsException();
        }

        if (userRepository.existsByAuth0Id(auth0Id)) {
            log.warn("Duplicate Auth0 ID: {}", auth0Id);
            throw new CompanyAlreadyExistsException();
        }

        String email =
                firstPresent(
                        auth0Email, companyDTO.user() == null ? null : companyDTO.user().email());

        if (email == null) {
            log.error("No email provided (auth0Email and DTO email both null)");
            throw new IllegalArgumentException("E-mail e obrigatorio.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.warn("Duplicate email: {}", email);
            throw new CompanyAlreadyExistsException();
        }

        Company company = new Company();
        company.setLegalName(companyDTO.legalName());
        company.setSocialName(companyDTO.socialName());
        company.setDescription(companyDTO.description());
        company.setLogoUrl(firstPresent(companyDTO.logoUrl(), ""));
        company.setCnpj(companyDTO.cnpj());
        company.setPhone(companyDTO.phone());

        log.info("Creating address...");
        Address address = addressService.createAddress(companyDTO.address());
        log.info("Address created | id={}", address.getId());

        company.setAddress(address);

        User user =
                User.builder()
                        .name(firstPresent(companyDTO.socialName(), companyDTO.legalName()))
                        .email(email)
                        .auth0Id(auth0Id)
                        .userType(UserType.company)
                        .build();

        User savedUser = userRepository.save(user);
        log.info("User created | id={} email={}", savedUser.getId(), savedUser.getEmail());
        company.setUser(savedUser);

        Company saved = companyRepository.save(company);
        log.info("Company persisted | id={} legalName={}", saved.getId(), saved.getLegalName());
        return companyToCompanyDTO(saved);
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
                .user(userToUserDTO(company.getUser()))
                .build();
    }

    private UserDTO userToUserDTO(User user) {
        return UserDTO.builder().name(user.getName()).email(user.getEmail()).build();
    }

    private String firstPresent(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }

        if (second != null && !second.isBlank()) {
            return second;
        }

        return null;
    }
}
