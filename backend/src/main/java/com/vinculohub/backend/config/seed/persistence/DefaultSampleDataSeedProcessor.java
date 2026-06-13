/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import com.vinculohub.backend.config.seed.auth0.Auth0ManagementClient;
import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.LoadedSampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SampleDataDatasetLoader;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedProcessor;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class DefaultSampleDataSeedProcessor implements SampleDataSeedProcessor {

    private final SampleDataDatasetLoader datasetLoader;
    private final SampleDataDatabaseGuard databaseGuard;
    private final Auth0ManagementClient auth0ManagementClient;
    private final CoreSampleDataPersister corePersister;

    @Override
    public SampleDataSeedResult process(SampleDataSeedProperties properties) {
        LoadedSampleDataDataset loaded = datasetLoader.load(properties.location());
        databaseGuard.requireEmptyFunctionalDatabase();
        ResolvedAuth0Users auth0Users =
                auth0ManagementClient.resolveExistingUsers(loaded.dataset().users());
        corePersister.persist(loaded.dataset(), auth0Users);
        return new SampleDataSeedResult(loaded.checksum());
    }
}
