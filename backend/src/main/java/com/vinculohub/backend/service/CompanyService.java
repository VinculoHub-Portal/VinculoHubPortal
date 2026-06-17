/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.dto.CompanyExportDTO;
import com.vinculohub.backend.dto.CompanyProfileResponse;
import com.vinculohub.backend.dto.UserDTO;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.exception.CompanyAlreadyExistsException;
import com.vinculohub.backend.exception.NotFoundException;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.User;
import com.vinculohub.backend.model.enums.UserType;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.utils.DocumentValidator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final NpoRepository npoRepository;
    private final AddressService addressService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CompanyExportDTO> findAllForExport() {
        return companyRepository.findAll().stream().map(this::toExportDTO).toList();
    }

    @Transactional(readOnly = true)
    public CompanyProfileResponse getCompanyProfileByAuth0Id(String auth0Id) {
        if (auth0Id == null || auth0Id.isBlank()) {
            throw new BadRequestException("Auth0 ID é obrigatório.");
        }

        User user =
                userRepository
                        .findByAuth0Id(auth0Id)
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada."));

        Company company =
                companyRepository
                        .findByUserId(user.getId())
                        .orElseThrow(() -> new NotFoundException("Empresa não encontrada."));

        return companyToCompanyProfileResponse(company);
    }

    private CompanyExportDTO toExportDTO(Company company) {
        var address = company.getAddress();
        var user = company.getUser();
        return CompanyExportDTO.builder()
                .id(company.getId())
                .legalName(company.getLegalName())
                .socialName(company.getSocialName())
                .cnpj(company.getCnpj())
                .phone(company.getPhone())
                .email(user != null ? user.getEmail() : null)
                .city(address != null ? address.getCity() : null)
                .state(address != null ? address.getState() : null)
                .zipCode(address != null ? address.getZipCode() : null)
                .createdAt(company.getCreatedAt())
                .build();
    }

    @Transactional
    public CompanyDTO createCompany(String auth0Id, String auth0Email, CompanyDTO companyDTO) {
        log.info(
                "Creating company | auth0Id={} email={} cnpj={}",
                auth0Id,
                auth0Email,
                companyDTO.cnpj());

        if (auth0Id == null || auth0Id.isBlank()) {
            log.error("Auth0 ID is blank");
            throw new BadRequestException("Auth0 ID é obrigatório.");
        }

        String sanitizedCnpj = DocumentValidator.sanitize(companyDTO.cnpj());
        if (companyRepository.existsByCnpj(sanitizedCnpj)
                || npoRepository.existsByCnpj(sanitizedCnpj)) {
            log.warn("Duplicate CNPJ: {}", sanitizedCnpj);
            throw new CompanyAlreadyExistsException(
                    "Já existe uma instituição cadastrada com este CNPJ.");
        }

        if (userRepository.existsByAuth0Id(auth0Id)) {
            log.warn("Duplicate Auth0 ID: {}", auth0Id);
            throw new CompanyAlreadyExistsException(
                    "Já existe uma conta cadastrada para este login.");
        }

        String email =
                firstPresent(
                        auth0Email, companyDTO.user() == null ? null : companyDTO.user().email());

        if (email == null) {
            log.error("No email provided (auth0Email and DTO email both null)");
            throw new BadRequestException("E-mail é obrigatório.");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            log.warn("Duplicate email: {}", email);
            throw new CompanyAlreadyExistsException(
                    "Já existe uma conta cadastrada com este e-mail.");
        }

        Company company = new Company();
        company.setLegalName(companyDTO.legalName());
        company.setSocialName(companyDTO.socialName());
        company.setDescription(companyDTO.description());
        company.setLogoUrl(firstPresent(companyDTO.logoUrl(), ""));
        company.setCnpj(sanitizedCnpj);
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

    private CompanyProfileResponse companyToCompanyProfileResponse(Company company) {
        User user = company.getUser();
        return new CompanyProfileResponse(
                new CompanyProfileResponse.InstitutionalData(
                        company.getId(),
                        company.getLegalName(),
                        company.getSocialName(),
                        company.getDescription(),
                        company.getLogoUrl(),
                        company.getCnpj(),
                        company.getPhone()),
                new CompanyProfileResponse.ContactData(user == null ? null : user.getEmail(), company.getPhone()),
                mapAddress(company.getAddress()),
                mapResponsible(user));
    }

    private CompanyProfileResponse.AddressData mapAddress(Address address) {
        if (address == null) {
            return null;
        }
        return new CompanyProfileResponse.AddressData(
                address.getId(),
                address.getState(),
                address.getStateCode(),
                address.getCity(),
                address.getStreet(),
                address.getNumber(),
                address.getComplement(),
                address.getZipCode());
    }

    private CompanyProfileResponse.ResponsibleData mapResponsible(User responsible) {
        if (responsible == null) {
            return null;
        }
        return new CompanyProfileResponse.ResponsibleData(
                responsible.getId(),
                responsible.getName(),
                responsible.getEmail(),
                responsible.getAuth0Id(),
                responsible.getUserType());
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
