package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.model.Company;
import com.vinculohub.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Integer companyId) {
        Optional<Company> companyOptional = companyService.findById(companyId);

        if (companyOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Company company = companyOptional.get();

        CompanyDTO companyDTO = CompanyDTO.builder()
                .id(company.getId())
                .legalName(company.getLegalName())
                .socialName(company.getSocialName())
                .description(company.getDescription())
                .logoUrl(company.getLogoUrl())
                .cnpj(company.getCnpj())
                .phone(company.getPhone())
                .build();

        return ResponseEntity.ok(companyDTO);
    }

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO companyDTO) {
        Company createdCompany = companyService.createCompany(companyDTO);

        CompanyDTO responseDTO = CompanyDTO.builder()
                .id(createdCompany.getId())
                .legalName(createdCompany.getLegalName())
                .socialName(createdCompany.getSocialName())
                .description(createdCompany.getDescription())
                .logoUrl(createdCompany.getLogoUrl())
                .cnpj(createdCompany.getCnpj())
                .phone(createdCompany.getPhone())
                .build();

        return ResponseEntity.status(201).body(responseDTO);
    }

    @PutMapping("/{companyId}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Integer companyId,
                                                    @RequestBody CompanyDTO companyDTO) {
        Company updatedCompany = companyService.updateCompany(companyId, companyDTO);

        CompanyDTO responseDTO = CompanyDTO.builder()
                .id(updatedCompany.getId())
                .legalName(updatedCompany.getLegalName())
                .socialName(updatedCompany.getSocialName())
                .description(updatedCompany.getDescription())
                .logoUrl(updatedCompany.getLogoUrl())
                .cnpj(updatedCompany.getCnpj())
                .phone(updatedCompany.getPhone())
                .build();

        return ResponseEntity.ok(responseDTO);
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Integer companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.noContent().build();
    }
}