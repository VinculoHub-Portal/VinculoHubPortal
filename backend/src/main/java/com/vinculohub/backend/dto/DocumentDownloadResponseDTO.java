/* (C)2026 */
package com.vinculohub.backend.dto;

import java.time.Instant;

public record DocumentDownloadResponseDTO(
        String downloadUrl, String fileName, String mimeType, Instant expiresAt) {}
