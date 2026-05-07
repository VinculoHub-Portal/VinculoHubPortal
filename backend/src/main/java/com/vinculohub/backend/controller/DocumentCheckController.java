/* (C)2026 */
package com.vinculohub.backend.controller;

import com.vinculohub.backend.service.DocumentCheckService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/public/validate")
@RequiredArgsConstructor
public class DocumentCheckController {

    private final DocumentCheckService documentCheckService;

    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<Map<String, Boolean>> checkCnpj(@PathVariable String cnpj) {
        boolean available = documentCheckService.isCnpjAvailable(cnpj);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/cpf/{cpf}")
    public ResponseEntity<Map<String, Boolean>> checkCpf(@PathVariable String cpf) {
        boolean available = documentCheckService.isCpfAvailable(cpf);
        return ResponseEntity.ok(Map.of("available", available));
    }

    @GetMapping("/email")
    public ResponseEntity<Map<String, Boolean>> checkEmail(@RequestParam String value) {
        boolean available = documentCheckService.isEmailAvailable(value);
        return ResponseEntity.ok(Map.of("available", available));
    }
}
