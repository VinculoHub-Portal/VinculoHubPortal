/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

public record AddressSeedRow(
        String key,
        String state,
        String stateCode,
        String city,
        String street,
        String number,
        String complement,
        String zipCode) {}
