/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CnpjResponseDto;
import com.vinculohub.backend.service.CnpjValidationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cnpj")
public class CnpjController {

    private final CnpjValidationService cnpjValidationService;

    public CnpjController(CnpjValidationService cnpjValidationService) {
        this.cnpjValidationService = cnpjValidationService;
    }

    @GetMapping("/{cnpj}")
    public CnpjResponseDto validate(@PathVariable String cnpj) {
        return cnpjValidationService.validate(cnpj);
    }
}
