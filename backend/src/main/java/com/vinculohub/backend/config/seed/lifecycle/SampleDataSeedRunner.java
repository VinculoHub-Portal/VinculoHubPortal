/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class SampleDataSeedRunner implements CommandLineRunner {

    private final SampleDataSeedLifecycle lifecycle;

    @Override
    public void run(String... args) {
        lifecycle.executeIfNeeded();
    }
}
