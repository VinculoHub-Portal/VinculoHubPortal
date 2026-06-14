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
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistoryRepository;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class DefaultSampleDataSeedProcessorTest {

    @Test
    void orchestratesValidationAndCorePersistenceInOrder(CapturedOutput output) {
        SampleDataDatasetLoader loader = mock(SampleDataDatasetLoader.class);
        Auth0ManagementClient auth0Client = mock(Auth0ManagementClient.class);
        SampleDataSeedHistoryRepository historyRepository =
                mock(SampleDataSeedHistoryRepository.class);
        SampleDataSeedTransactionExecutor transactionExecutor =
                mock(SampleDataSeedTransactionExecutor.class);
        SampleDataDataset dataset = emptyDataset();
        ResolvedAuth0Users auth0Users = new ResolvedAuth0Users(Map.of());
        SampleDataSeedProperties properties =
                new SampleDataSeedProperties(true, "e2e", "classpath:seed/e2e");
        LoadedSampleDataDataset loaded = new LoadedSampleDataDataset(dataset, "checksum");
        when(loader.load(properties.location())).thenReturn(loaded);
        when(historyRepository.findById("e2e")).thenReturn(Optional.empty());
        when(auth0Client.resolveExistingUsers(dataset.users())).thenReturn(auth0Users);
        when(transactionExecutor.execute("e2e", loaded, auth0Users))
                .thenReturn(new SampleDataSeedResult("checksum"));

        SampleDataSeedResult result =
                new DefaultSampleDataSeedProcessor(
                                loader, auth0Client, historyRepository, transactionExecutor)
                        .process(properties);

        assertThat(result.checksum()).isEqualTo("checksum");
        InOrder order = inOrder(loader, historyRepository, auth0Client, transactionExecutor);
        order.verify(loader).load(properties.location());
        order.verify(historyRepository).findById("e2e");
        order.verify(auth0Client).resolveExistingUsers(dataset.users());
        order.verify(transactionExecutor).execute("e2e", loaded, auth0Users);
        assertThat(output)
                .contains("Sample data dataset validated")
                .contains("datasetId=e2e")
                .contains("users=0")
                .contains("projectOds=0")
                .doesNotContain("%d");
    }

    private SampleDataDataset emptyDataset() {
        return new SampleDataDataset(
                List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of(),
                List.of());
    }
}
