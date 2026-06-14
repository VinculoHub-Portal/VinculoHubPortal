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
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.sample-data", name = "enabled", havingValue = "true")
public class DefaultSampleDataSeedProcessor implements SampleDataSeedProcessor {

    private final SampleDataDatasetLoader datasetLoader;
    private final SampleDataDatabaseGuard databaseGuard;
    private final Auth0ManagementClient auth0ManagementClient;
    private final CoreSampleDataPersister corePersister;
    private final DomainRelationSampleDataPersister relationPersister;

    @Override
    public SampleDataSeedResult process(SampleDataSeedProperties properties) {
        LoadedSampleDataDataset loaded = datasetLoader.load(properties.location());
        log.info(
                "Sample data dataset validated | datasetId={} rows={} {} checksum={}",
                properties.datasetId(),
                loaded.dataset().rowCount(),
                loaded.dataset().summary(),
                loaded.checksum());
        databaseGuard.requireEmptyFunctionalDatabase();
        ResolvedAuth0Users auth0Users =
                auth0ManagementClient.resolveExistingUsers(loaded.dataset().users());
        PersistedSampleData persisted = corePersister.persist(loaded.dataset(), auth0Users);
        relationPersister.persist(loaded.dataset(), persisted);
        log.info(
                "Sample data entities persisted | datasetId={} users={} addresses={} companies={} "
                        + "npos={} projects={} companyProjects={} npoReports={}",
                properties.datasetId(),
                persisted.users().size(),
                persisted.addresses().size(),
                persisted.companies().size(),
                persisted.npos().size(),
                persisted.projects().size(),
                loaded.dataset().companyProjects().size(),
                loaded.dataset().npoReports().size());
        return new SampleDataSeedResult(loaded.checksum());
    }
}
