/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

public record SampleDataSeedResult(String checksum) {

    public SampleDataSeedResult {
        if (checksum == null || checksum.isBlank()) {
            throw new IllegalArgumentException("Seed checksum must not be blank.");
        }
    }
}
