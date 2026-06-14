/* (C)2026 */
package com.vinculohub.backend.config.seed.dataset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.DefaultResourceLoader;

class SampleDataDatasetLoaderTest {

    @TempDir private Path datasetDirectory;

    private SampleDataDatasetLoader loader;

    @BeforeEach
    void setUp() {
        SampleDataDatasetReader reader = new SampleDataDatasetReader(new DefaultResourceLoader());
        loader = new SampleDataDatasetLoader(reader, TestSeedRows.validator());
    }

    @Test
    void rejectsDatasetContainingOnlyHeaders() throws IOException {
        createDataset(Map.of());

        assertThatThrownBy(() -> loader.load(datasetDirectory.toUri().toString()))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("every CSV file contains only its header");
    }

    @Test
    void loadsTypedDatasetAndProducesStableChecksum() throws IOException {
        createDataset(
                Map.of(
                        SampleDataCsvFile.USERS,
                        "company_user,Company User,company@example.test,company"));

        LoadedSampleDataDataset first = loader.load(datasetDirectory.toUri().toString());
        LoadedSampleDataDataset second = loader.load(datasetDirectory.toUri().toString());

        assertThat(first.dataset().users()).hasSize(1);
        assertThat(first.dataset().users().get(0).value().key()).isEqualTo("company_user");
        assertThat(first.checksum()).hasSize(64).isEqualTo(second.checksum());
    }

    @Test
    void reportsInvalidEnumWithFileLineAndColumn() throws IOException {
        createDataset(
                Map.of(
                        SampleDataCsvFile.USERS,
                        "company_user,Company User,company@example.test,COMPANY"));

        assertThatThrownBy(() -> loader.load(datasetDirectory.toUri().toString()))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("users.csv:2 [user_type]")
                .hasMessageContaining("unsupported enum");
    }

    @Test
    void rejectsDuplicateLogicalKeys() throws IOException {
        createDataset(
                Map.of(
                        SampleDataCsvFile.USERS,
                        """
                        duplicate_user,First User,first@example.test,company
                        duplicate_user,Second User,second@example.test,company"""));

        assertThatThrownBy(() -> loader.load(datasetDirectory.toUri().toString()))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("users.csv:3 [key]")
                .hasMessageContaining("duplicates logical key");
    }

    @Test
    void rejectsUnknownLogicalReference() throws IOException {
        createDataset(
                Map.of(
                        SampleDataCsvFile.COMPANIES,
                        "company_one,missing_user,,Legal Name,Trade Name,,,,"));

        assertThatThrownBy(() -> loader.load(datasetDirectory.toUri().toString()))
                .isInstanceOf(SeedDatasetException.class)
                .hasMessageContaining("companies.csv:2 [user_key]")
                .hasMessageContaining("unknown logical key 'missing_user'");
    }

    private void createDataset(Map<SampleDataCsvFile, String> rowsByFile) throws IOException {
        for (SampleDataCsvFile file : SampleDataCsvFile.values()) {
            String rows = rowsByFile.get(file);
            String content = String.join(",", file.headers()) + System.lineSeparator();
            if (rows != null && !rows.isBlank()) {
                content += rows.strip() + System.lineSeparator();
            }
            Files.writeString(
                    datasetDirectory.resolve(file.fileName()), content, StandardCharsets.UTF_8);
        }
    }
}
