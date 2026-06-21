/* (C)2026 */
package com.vinculohub.backend.service;

import com.vinculohub.backend.dto.AdminNpoCardResponse;
import com.vinculohub.backend.exception.BadRequestException;
import com.vinculohub.backend.repository.NpoRepository;
import com.vinculohub.backend.repository.projection.AdminNpoCardProjection;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminNpoService {

    private final NpoRepository npoRepository;

    @Transactional(readOnly = true)
    public Page<AdminNpoCardResponse> listNpos(
            String search, String area, Boolean active, Pageable pageable) {
        String normalizedSearch = trimToNull(search);
        String normalizedArea = normalizeArea(area);
        Page<AdminNpoCardProjection> page =
                npoRepository.findAdminCards(normalizedSearch, normalizedArea, active, pageable);
        return page.map(this::toResponse);
    }

    private AdminNpoCardResponse toResponse(AdminNpoCardProjection projection) {
        return new AdminNpoCardResponse(
                projection.getId(),
                projection.getName(),
                projection.getLogoUrl(),
                Boolean.TRUE.equals(projection.getActive()),
                Boolean.TRUE.equals(projection.getEnvironmental()),
                Boolean.TRUE.equals(projection.getSocial()),
                Boolean.TRUE.equals(projection.getGovernance()),
                projection.getCity(),
                projection.getStateCode(),
                projection.getCreatedAt());
    }

    private String normalizeArea(String area) {
        String normalized = trimToNull(area);
        if (normalized == null || normalized.equalsIgnoreCase("all")) {
            return null;
        }

        String lower = normalized.toLowerCase(Locale.ROOT);
        if (!lower.equals("environmental")
                && !lower.equals("social")
                && !lower.equals("governance")) {
            throw new BadRequestException("Área de atuação inválida.");
        }

        return lower;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
