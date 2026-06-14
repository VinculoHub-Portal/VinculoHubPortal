/* (C)2026 */
package com.vinculohub.backend.config.seed;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class SampleDataSeedPropertiesTest {

    @Test
    void acceptsDisabledSeedWithoutOperationalConfiguration() {
        assertThatCode(() -> new SampleDataSeedProperties(false, null, null))
                .doesNotThrowAnyException();
    }

    @Test
    void rejectsBlankDatasetIdWhenEnabled() {
        assertThatThrownBy(() -> new SampleDataSeedProperties(true, " ", "file:/sample-data"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dataset-id");
    }

    @Test
    void rejectsDatasetIdLongerThanDatabaseColumn() {
        assertThatThrownBy(
                        () ->
                                new SampleDataSeedProperties(
                                        true, "x".repeat(101), "file:/sample-data"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at most 100");
    }

    @Test
    void normalizesEnabledSeedIdentifiers() {
        SampleDataSeedProperties properties =
                new SampleDataSeedProperties(true, " e2e-local ", " file:/sample-data ");

        assertThat(properties.datasetId()).isEqualTo("e2e-local");
        assertThat(properties.location()).isEqualTo("file:/sample-data");
    }
}
