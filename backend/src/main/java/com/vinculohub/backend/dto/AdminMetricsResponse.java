/* (C)2026 */
package com.vinculohub.backend.dto;

public record AdminMetricsResponse(
        long totalNpos,
        long publishedEditais,
        long activeVinculos,
        long pendingNotifications) {}
