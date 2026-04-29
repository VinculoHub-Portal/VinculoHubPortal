/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.repository.CompanyRepository;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.UserRepository;
import com.vinculohub.backend.utils.DocumentValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentCheckService {

    private final NpoRepository npoRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public boolean isCnpjAvailable(String cnpj) {
        String sanitized = DocumentValidator.sanitize(cnpj);
        if (sanitized == null || sanitized.isBlank()) {
            return true;
        }
        boolean inUse =
                npoRepository.existsByCnpj(sanitized) || companyRepository.existsByCnpj(sanitized);
        log.info("Verificação de CNPJ {}: {}", sanitized, inUse ? "em uso" : "disponível");
        return !inUse;
    }

    public boolean isEmailAvailable(String email) {
        if (email == null || email.isBlank()) {
            return true;
        }
        boolean inUse = userRepository.existsByEmailIgnoreCase(email.trim());
        log.info("Verificação de e-mail {}: {}", email.trim(), inUse ? "em uso" : "disponível");
        return !inUse;
    }

    public boolean isCpfAvailable(String cpf) {
        String sanitized = DocumentValidator.sanitize(cpf);
        if (sanitized == null || sanitized.isBlank()) {
            return true;
        }
        boolean inUse = npoRepository.existsByCpf(sanitized);
        log.info("Verificação de CPF {}: {}", sanitized, inUse ? "em uso" : "disponível");
        return !inUse;
    }
}
