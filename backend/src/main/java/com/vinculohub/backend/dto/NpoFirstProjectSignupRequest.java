/* (C)2026 */
package com.vinculohub.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record NpoFirstProjectSignupRequest(
        String name, String description, BigDecimal capital, List<String> ods) {}
