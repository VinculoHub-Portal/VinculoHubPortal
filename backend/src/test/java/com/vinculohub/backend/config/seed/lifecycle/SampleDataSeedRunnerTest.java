/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import org.junit.jupiter.api.Test;

class SampleDataSeedRunnerTest {

    @Test
    void delegatesStartupExecutionToLifecycle() {
        SampleDataSeedLifecycle lifecycle = mock(SampleDataSeedLifecycle.class);

        new SampleDataSeedRunner(lifecycle).run();

        verify(lifecycle).executeIfNeeded();
    }
}
