/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.dto.CepResponseDTO;
import com.vinculohub.backend.service.CepValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/cep")
public class CepController {

    private final CepValidationService cepValidationService;

    public CepController(CepValidationService cepValidationService) {
        this.cepValidationService = cepValidationService;
    }

    @GetMapping("/{cep}")
    public CepResponseDTO validate(@PathVariable String cep) {
        log.info("GET /cep/{}", cep);
        return cepValidationService.validate(cep);
    }
}
