/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EditalResponseDTO(
        Long id,
        String title,
        String description,
        String fileUrl,
        String fileName,
        Long fileSize,
        String mimeType,
        List<OdsResponse> ods,
        LocalDateTime expiredAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
