/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

public record SampleDataSeedResult(String checksum, boolean executed) {

    public SampleDataSeedResult(String checksum) {
        this(checksum, true);
    }

    public SampleDataSeedResult {
        if (checksum == null || checksum.isBlank()) {
            throw new IllegalArgumentException("Seed checksum must not be blank.");
        }
    }

    public static SampleDataSeedResult skipped(String checksum) {
        return new SampleDataSeedResult(checksum, false);
    }
}
