/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CompanyDTO;
import com.vinculohub.backend.dto.CompanyRegistrationDTO;
import com.vinculohub.backend.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PublicCompanyController {

    private final CompanyService companyService;

    @PostMapping("/register")
    public ResponseEntity<CompanyDTO> registerCompany(@RequestBody CompanyRegistrationDTO dto) {
        return ResponseEntity.status(201).body(companyService.registerCompany(dto));
    }
}
