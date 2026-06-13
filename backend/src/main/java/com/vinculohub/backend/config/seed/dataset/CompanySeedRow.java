/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

public record CompanySeedRow(
        String key,
        String userKey,
        String addressKey,
        String legalName,
        String socialName,
        String description,
        String logoUrl,
        String cnpj,
        String phone) {}
