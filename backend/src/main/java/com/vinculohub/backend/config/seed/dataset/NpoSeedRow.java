/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.NpoSize;

public record NpoSeedRow(
        String key,
        String userKey,
        String addressKey,
        String name,
        String description,
        String logoUrl,
        NpoSize npoSize,
        String cnpj,
        String cpf,
        String phone,
        boolean environmental,
        boolean social,
        boolean governance) {}
