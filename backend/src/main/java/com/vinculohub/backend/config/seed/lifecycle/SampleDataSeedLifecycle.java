/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class SampleDataSeedLifecycle {

    private final SampleDataSeedProperties properties;
    private final SampleDataSeedProcessor processor;

    public void executeIfNeeded() {
        String datasetId = properties.datasetId();
        log.info("Sample data seed checking | datasetId={}", datasetId);
        SampleDataSeedResult result = processor.process(properties);
        if (!result.executed()) {
            log.info("Sample data seed already executed | datasetId={}", datasetId);
            return;
        }
        log.info("Sample data seed completed | datasetId={}", datasetId);
    }
}
