package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Integer companyId) {
        return companyService.findById(companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CompanyDTO> createCompany(@RequestBody CompanyDTO companyDTO) {
        return ResponseEntity.status(201).body(companyService.createCompany(companyDTO));
    }

    @PutMapping("/{companyId}")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Integer companyId,
                                                    @RequestBody CompanyDTO companyDTO) {
        return ResponseEntity.ok(companyService.updateCompany(companyId, companyDTO));
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Integer companyId) {
        companyService.deleteCompany(companyId);
        return ResponseEntity.noContent().build();
    }
}