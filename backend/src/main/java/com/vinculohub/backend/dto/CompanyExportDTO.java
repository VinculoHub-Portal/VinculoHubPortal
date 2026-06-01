/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record CompanyExportDTO(
        Integer id,
        String legalName,
        String socialName,
        String cnpj,
        String phone,
        String email,
        String city,
        String state,
        String zipCode,
        LocalDateTime createdAt) {}
