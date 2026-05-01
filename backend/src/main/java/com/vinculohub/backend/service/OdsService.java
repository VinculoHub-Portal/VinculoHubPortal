/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.model.Ods;
import com.vinculohub.backend.repository.OdsRepository;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class OdsService {

    private final OdsRepository odsRepository;

    public OdsService(OdsRepository odsRepository) {
        this.odsRepository = odsRepository;
    }

    public List<Ods> findAll() {
        return odsRepository.findAll(Sort.by("id"));
    }

    public Set<Ods> resolveSelection(List<String> selectedIds) {
        if (selectedIds == null || selectedIds.isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos um ODS.");
        }

        Set<Integer> ids = new LinkedHashSet<>();
        for (String value : selectedIds) {
            String normalized = normalize(value);
            if (normalized == null) {
                throw new IllegalArgumentException("ODS inválido.");
            }

            try {
                ids.add(Integer.valueOf(normalized));
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("ODS inválido.", ex);
            }
        }

        Map<Integer, Ods> foundById =
                StreamSupport.stream(odsRepository.findAllById(ids).spliterator(), false)
                        .collect(
                                Collectors.toMap(
                                        Ods::getId,
                                        ods -> ods,
                                        (left, right) -> left,
                                        LinkedHashMap::new));

        if (foundById.size() != ids.size()) {
            throw new IllegalArgumentException("ODS inválido.");
        }

        return ids.stream()
                .map(
                        id -> {
                            Ods ods = foundById.get(id);
                            if (ods == null) {
                                throw new IllegalArgumentException("ODS inválido.");
                            }
                            return ods;
                        })
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private static String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
