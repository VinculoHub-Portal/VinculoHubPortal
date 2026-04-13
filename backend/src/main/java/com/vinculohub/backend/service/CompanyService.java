package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.model.Address;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.model.Users;
import com.vinculohub.backend.repository.AddressRepository;
import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.UsersRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
            Address address = addressRepository.findById(dto.address().id())
                    .orElseThrow(() -> new EntityNotFoundException("Address not found"));
            company.setAddress(address);
        }

        if (dto.user() != null) {
            Users user = usersRepository.findById(dto.user().id())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            company.setUser(user);
        }

        return CompanyDTO.from(companyRepository.save(company));
    }

    public CompanyDTO updateCompany(Integer id, CompanyDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));

        company.setLegalName(dto.legalName());
        company.setSocialName(dto.socialName());
        company.setDescription(dto.description());
        company.setLogoUrl(dto.logoUrl());
        company.setCnpj(dto.cnpj());
        company.setPhone(dto.phone());

        if (dto.address() != null) {
            Address address = addressRepository.findById(dto.address().id())
                    .orElseThrow(() -> new EntityNotFoundException("Address not found"));
            company.setAddress(address);
        }

        if (dto.user() != null) {
            Users user = usersRepository.findById(dto.user().id())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
            company.setUser(user);
        }

        return CompanyDTO.from(companyRepository.save(company));
    }

    public void deleteCompany(Integer id) {
        companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found"));
        companyRepository.deleteById(id);
    }
}