/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.vinculohub.backend.config.seed.auth0.Auth0ManagementClient;
import com.vinculohub.backend.config.seed.dataset.SampleDataDatasetLoader;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistoryRepository;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedProcessor;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class SampleDataSeedProcessorConditionTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner()
                    .withUserConfiguration(DefaultSampleDataSeedProcessor.class)
                    .withBean(
                            SampleDataDatasetLoader.class,
                            () -> mock(SampleDataDatasetLoader.class))
                    .withBean(Auth0ManagementClient.class, () -> mock(Auth0ManagementClient.class))
                    .withBean(
                            SampleDataSeedHistoryRepository.class,
                            () -> mock(SampleDataSeedHistoryRepository.class))
                    .withBean(
                            SampleDataSeedTransactionExecutor.class,
                            () -> mock(SampleDataSeedTransactionExecutor.class));

    @Test
    void doesNotRegisterProcessorWhenSeedIsDisabled() {
        contextRunner.run(
                context -> assertThat(context).doesNotHaveBean(SampleDataSeedProcessor.class));
    }

    @Test
    void registersOnlyDefaultProcessorWhenSeedIsEnabled() {
        contextRunner
                .withPropertyValues("app.sample-data.enabled=true")
                .run(
                        context -> {
                            assertThat(context).hasSingleBean(SampleDataSeedProcessor.class);
                            assertThat(context)
                                    .getBean(SampleDataSeedProcessor.class)
                                    .isInstanceOf(DefaultSampleDataSeedProcessor.class);
                        });
    }
}
