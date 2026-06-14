/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.config.seed.SampleDataSeedProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SampleDataSeedLifecycleTest {

    @Mock private SampleDataSeedProcessor processor;

    private SampleDataSeedProperties properties;
    private SampleDataSeedLifecycle lifecycle;

    @BeforeEach
    void setUp() {
        properties =
                new SampleDataSeedProperties(true, "default", "classpath:db/sample-data/default");
        lifecycle = new SampleDataSeedLifecycle(properties, processor);
    }

    @Test
    void skipsDatasetAlreadyRegisteredInHistory() {
        when(processor.process(properties)).thenReturn(SampleDataSeedResult.skipped("checksum"));

        lifecycle.executeIfNeeded();

        verify(processor).process(properties);
    }

    @Test
    void processesAndRegistersNewDataset() {
        when(processor.process(properties)).thenReturn(new SampleDataSeedResult("checksum"));

        lifecycle.executeIfNeeded();

        verify(processor).process(properties);
    }

    @Test
    void doesNotRegisterHistoryWhenProcessingFails() {
        when(processor.process(properties))
                .thenThrow(new SampleDataSeedException("dataset validation failed"));

        assertThatThrownBy(lifecycle::executeIfNeeded)
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessage("dataset validation failed");
    }
}
