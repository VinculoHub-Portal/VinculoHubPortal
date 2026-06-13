/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class SampleDataSeedLifecycle {

    private final SampleDataSeedProperties properties;
    private final SampleDataSeedHistoryRepository historyRepository;
    private final SampleDataSeedProcessor processor;

    @Transactional
    public void executeIfNeeded() {
        String datasetId = properties.datasetId();
        if (historyRepository.existsById(datasetId)) {
            log.info("Sample data seed already executed | datasetId={}", datasetId);
            return;
        }

        SampleDataSeedResult result = processor.process(properties);
        historyRepository.save(
                new SampleDataSeedHistory(datasetId, result.checksum(), LocalDateTime.now()));
        log.info("Sample data seed completed | datasetId={}", datasetId);
    }
}
