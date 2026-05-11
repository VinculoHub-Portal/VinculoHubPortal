/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.LocalDateTime;

public record EditalResponseDTO(
        Long id,
        String title,
        String description,
        String fileUrl,
        String fileName,
        Long fileSize,
        String mimeType,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
