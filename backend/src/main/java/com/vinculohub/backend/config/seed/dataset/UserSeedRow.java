/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import com.vinculohub.backend.model.enums.UserType;

public record UserSeedRow(String key, String name, String email, UserType userType) {}
