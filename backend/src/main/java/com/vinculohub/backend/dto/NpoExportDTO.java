/* (C)2026 */
package com.vinculohub.backend.dto;

import com.vinculohub.backend.model.enums.NpoSize;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record NpoExportDTO(
        Integer id,
        String name,
        String cnpj,
        String cpf,
        String phone,
        NpoSize npoSize,
        Boolean environmental,
        Boolean social,
        Boolean governance,
        String city,
        String state,
        String zipCode,
        LocalDateTime createdAt) {}
