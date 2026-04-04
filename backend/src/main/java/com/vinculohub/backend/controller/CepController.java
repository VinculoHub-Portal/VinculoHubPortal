/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CepResponseDto;
import com.vinculohub.backend.service.CepValidationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/cep")
public class CepController {

    private final CepValidationService cepValidationService;

    public CepController(CepValidationService cepValidationService) {
        this.cepValidationService = cepValidationService;
    }

    @GetMapping("/{cep}")
    public CepResponseDto validate(@PathVariable String cep) {
        return cepValidationService.validate(cep);
    }
}
