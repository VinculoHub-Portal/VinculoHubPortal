/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import com.vinculohub.backend.config.seed.auth0.Auth0ManagementClient;
import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.LoadedSampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SampleDataDatasetLoader;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;

class DefaultSampleDataSeedProcessorTest {

    @Test
    void orchestratesValidationAndCorePersistenceInOrder() {
        SampleDataDatasetLoader loader = mock(SampleDataDatasetLoader.class);
        SampleDataDatabaseGuard guard = mock(SampleDataDatabaseGuard.class);
        Auth0ManagementClient auth0Client = mock(Auth0ManagementClient.class);
        CoreSampleDataPersister persister = mock(CoreSampleDataPersister.class);
        SampleDataDataset dataset = emptyDataset();
        ResolvedAuth0Users auth0Users = new ResolvedAuth0Users(Map.of());
        SampleDataSeedProperties properties =
                new SampleDataSeedProperties(true, "e2e", "classpath:seed/e2e");
        when(loader.load(properties.location()))
                .thenReturn(new LoadedSampleDataDataset(dataset, "checksum"));
        when(auth0Client.resolveExistingUsers(dataset.users())).thenReturn(auth0Users);

        SampleDataSeedResult result =
                new DefaultSampleDataSeedProcessor(loader, guard, auth0Client, persister)
                        .process(properties);

        assertThat(result.checksum()).isEqualTo("checksum");
        InOrder order = inOrder(loader, guard, auth0Client, persister);
        order.verify(loader).load(properties.location());
        order.verify(guard).requireEmptyFunctionalDatabase();
        order.verify(auth0Client).resolveExistingUsers(dataset.users());
        order.verify(persister).persist(dataset, auth0Users);
    }

    private SampleDataDataset emptyDataset() {
        return new SampleDataDataset(
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
                List.of());
    }
}
