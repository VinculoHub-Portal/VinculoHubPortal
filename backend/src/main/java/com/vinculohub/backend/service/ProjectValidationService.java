/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.NpoFirstProjectSignupRequest;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProjectValidationService {

    public void validateFirstProject(NpoFirstProjectSignupRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Os dados do primeiro projeto são obrigatórios.");
        }

        requireText(request.name(), "Nome do projeto é obrigatório.");
        requireText(request.description(), "Descrição do projeto é obrigatória.");
        validateCapital(request.capital());
        validateOds(request.ods());
    }

    private static void validateCapital(BigDecimal capital) {
        if (capital != null && capital.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("A meta de captação não pode ser negativa.");
        }
    }

    private static void validateOds(List<String> ods) {
        if (ods == null || ods.isEmpty()) {
            throw new IllegalArgumentException(
                    "É obrigatório informar ao menos um ODS para o projeto.");
        }

        for (String value : ods) {
            requireText(value, "ODS inválido.");
        }
    }

    private static String requireText(String value, String message) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }
}
