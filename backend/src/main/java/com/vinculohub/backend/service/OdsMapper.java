/* (C)2026 */
package com.vinculohub.backend.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class OdsMapper {

    public Set<Integer> normalizeCodes(List<String> ods) {
        if (ods == null) {
            return Set.of();
        }

        Set<Integer> result = new LinkedHashSet<>();
        for (String value : ods) {
            if (value == null || value.trim().isEmpty()) {
                throw new IllegalArgumentException("ODS inválido.");
            }

            try {
                result.add(Integer.parseInt(value.trim()));
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("ODS inválido.", ex);
            }
        }

        return result;
    }
}
