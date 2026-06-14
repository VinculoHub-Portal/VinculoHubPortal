/* (C)2026 */
package com.vinculohub.backend.config.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.sample-data")
public record SampleDataSeedProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("default") String datasetId,
        @DefaultValue("classpath:db/sample-data/default") String location) {

    public SampleDataSeedProperties {
        if (enabled) {
            requireText(datasetId, "app.sample-data.dataset-id");
            requireText(location, "app.sample-data.location");
            datasetId = datasetId.trim();
            location = location.trim();
            if (datasetId.length() > 100) {
                throw new IllegalArgumentException(
                        "app.sample-data.dataset-id must contain at most 100 characters.");
            }
        }
    }

    private static void requireText(String value, String property) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(
                    property + " is required when sample data seed is enabled.");
        }
    }
}
