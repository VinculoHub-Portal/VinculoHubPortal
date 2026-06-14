/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import com.vinculohub.backend.config.seed.auth0.Auth0ManagementClient;
import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.LoadedSampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SampleDataDatasetLoader;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistory;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistoryRepository;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedProcessor;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class DefaultSampleDataSeedProcessor implements SampleDataSeedProcessor {

    private final SampleDataDatasetLoader datasetLoader;
    private final Auth0ManagementClient auth0ManagementClient;
    private final SampleDataSeedHistoryRepository historyRepository;
    private final SampleDataSeedTransactionExecutor transactionExecutor;

    @Override
    public SampleDataSeedResult process(SampleDataSeedProperties properties) {
        LoadedSampleDataDataset loaded = datasetLoader.load(properties.location());
        log.info(
                "Sample data dataset validated | datasetId={} rows={} {} checksum={}",
                properties.datasetId(),
                loaded.dataset().rowCount(),
                loaded.dataset().summary(),
                loaded.checksum());
        SampleDataSeedHistory existing =
                historyRepository.findById(properties.datasetId()).orElse(null);
        if (existing != null) {
            SampleDataSeedTransactionExecutor.requireMatchingChecksum(
                    properties.datasetId(), existing.getChecksum(), loaded.checksum());
            return SampleDataSeedResult.skipped(loaded.checksum());
        }

        ResolvedAuth0Users auth0Users =
                auth0ManagementClient.resolveExistingUsers(loaded.dataset().users());
        return transactionExecutor.execute(properties.datasetId(), loaded, auth0Users);
    }
}
