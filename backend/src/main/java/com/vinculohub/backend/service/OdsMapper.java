/* (C)2026 */
package com.vinculohub.backend.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class OdsMapper {

    public Set<Integer> normalizeCodes(List<String> values) {
        if (values == null || values.isEmpty()) {
            throw new IllegalArgumentException(
                    "É obrigatório informar ao menos um ODS para o projeto.");
        }

        Set<Integer> normalized = new LinkedHashSet<>();

        for (String value : values) {
            normalized.add(normalizeCode(value));
        }

        return normalized;
    }

    private Integer normalizeCode(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("ODS inválido.");
        }

        final int code;
        try {
            code = Integer.parseInt(value.trim());
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("ODS inválido: " + value);
        }

        if (code < 1 || code > 17) {
            throw new IllegalArgumentException("ODS inválido: " + value);
        }

        return code;
    }
}
