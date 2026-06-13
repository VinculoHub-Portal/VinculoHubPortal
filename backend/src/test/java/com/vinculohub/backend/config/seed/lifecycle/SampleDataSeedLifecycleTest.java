/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SampleDataSeedLifecycleTest {

    @Mock private SampleDataSeedHistoryRepository historyRepository;
    @Mock private SampleDataSeedProcessor processor;

    private SampleDataSeedProperties properties;
    private SampleDataSeedLifecycle lifecycle;

    @BeforeEach
    void setUp() {
        properties =
                new SampleDataSeedProperties(true, "default", "classpath:db/sample-data/default");
        lifecycle = new SampleDataSeedLifecycle(properties, historyRepository, processor);
    }

    @Test
    void skipsDatasetAlreadyRegisteredInHistory() {
        when(historyRepository.existsById("default")).thenReturn(true);

        lifecycle.executeIfNeeded();

        verify(processor, never()).process(properties);
        verify(historyRepository, never()).save(ArgumentMatchers.any());
    }

    @Test
    void processesAndRegistersNewDataset() {
        when(historyRepository.existsById("default")).thenReturn(false);
        when(processor.process(properties)).thenReturn(new SampleDataSeedResult("checksum"));

        lifecycle.executeIfNeeded();

        verify(processor).process(properties);
        verify(historyRepository)
                .save(
                        ArgumentMatchers.argThat(
                                history ->
                                        history.getDatasetId().equals("default")
                                                && history.getChecksum().equals("checksum")
                                                && history.getExecutedAt() != null));
    }
}
