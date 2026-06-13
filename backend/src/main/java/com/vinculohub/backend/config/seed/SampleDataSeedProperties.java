/* (C)2026 */
package com.vinculohub.backend.config.seed;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

@ConfigurationProperties(prefix = "app.sample-data")
public record SampleDataSeedProperties(
        @DefaultValue("false") boolean enabled,
        @DefaultValue("default") String datasetId,
        @DefaultValue("classpath:db/sample-data/default") String location) {}
