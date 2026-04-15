/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CnpjResponseDTO;
import com.vinculohub.backend.service.CnpjValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/cnpj")
public class CnpjController {

    private final CnpjValidationService cnpjValidationService;

    public CnpjController(CnpjValidationService cnpjValidationService) {
        this.cnpjValidationService = cnpjValidationService;
    }

    @GetMapping("/{cnpj}")
    public CnpjResponseDTO validate(@PathVariable String cnpj) {
        log.info("GET /cnpj/{}", cnpj);
        return cnpjValidationService.validate(cnpj);
    }
}
