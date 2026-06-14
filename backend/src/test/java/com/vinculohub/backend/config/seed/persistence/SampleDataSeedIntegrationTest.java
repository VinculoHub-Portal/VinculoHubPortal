/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.LoadedSampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.ProjectOdsSeedRow;
import com.vinculohub.backend.config.seed.dataset.SampleDataCsvFile;
import com.vinculohub.backend.config.seed.dataset.SampleDataDataset;
import com.vinculohub.backend.config.seed.dataset.SampleDataDatasetLoader;
import com.vinculohub.backend.config.seed.dataset.SeedRow;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import com.vinculohub.backend.database.AbstractIntegrationTest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class SampleDataSeedIntegrationTest extends AbstractIntegrationTest {

    @TempDir private Path datasetDirectory;

    @Autowired private SampleDataDatasetLoader datasetLoader;
    @Autowired private SampleDataSeedTransactionExecutor transactionExecutor;
    @Autowired private SampleDataDatabaseGuard databaseGuard;
    @Autowired private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void cleanFunctionalTables() {
        truncateFunctionalTables();
    }

    @AfterEach
    void cleanUpFunctionalTables() {
        truncateFunctionalTables();
    }

    private void truncateFunctionalTables() {
        jdbcTemplate.execute(
                """
                TRUNCATE TABLE
                    npo_report,
                    company_project,
                    project_ods,
                    document,
                    edital,
                    project,
                    npo,
                    company,
                    address,
                    users,
                    sample_data_seed_history
                RESTART IDENTITY CASCADE
                """);
    }

    @Test
    void persistsCompleteDatasetAndSkipsSameChecksumOnRestart() throws IOException {
        LoadedSampleDataDataset loaded = loadCompleteDataset();
        ResolvedAuth0Users auth0Users =
                new ResolvedAuth0Users(
                        Map.of(
                                "company_user", "auth0|company",
                                "npo_user", "auth0|npo"));

        SampleDataSeedResult first =
                transactionExecutor.execute("integration-v1", loaded, auth0Users);
        SampleDataSeedResult second =
                transactionExecutor.execute("integration-v1", loaded, auth0Users);

        assertThat(first.executed()).isTrue();
        assertThat(second.executed()).isFalse();
        assertCount("users", 2);
        assertCount("address", 2);
        assertCount("company", 1);
        assertCount("npo", 1);
        assertCount("project", 1);
        assertCount("project_ods", 1);
        assertCount("company_project", 1);
        assertCount("npo_report", 1);
        assertCount("sample_data_seed_history", 1);
        assertThat(jdbcTemplate.queryForObject("SELECT cnpj FROM company", String.class))
                .isEqualTo("11222333000181");
        assertThat(jdbcTemplate.queryForObject("SELECT cpf FROM npo", String.class))
                .isEqualTo("52998224725");
        assertThat(
                        jdbcTemplate.queryForObject(
                                """
                                SELECT reporter_user_id = company.user_id
                                FROM npo_report
                                JOIN company ON company.id = npo_report.reporter_company_id
                                """,
                                Boolean.class))
                .isTrue();
        assertThat(
                        jdbcTemplate.queryForObject(
                                "SELECT checksum FROM sample_data_seed_history WHERE dataset_id ="
                                        + " ?",
                                String.class,
                                "integration-v1"))
                .isEqualTo(loaded.checksum());
    }

    @Test
    void physicalGuardDetectsSoftDeletedRows() {
        jdbcTemplate.update(
                """
                INSERT INTO users (name, email, user_type, deleted_at)
                VALUES ('Deleted User', 'deleted@example.test', 'company', CURRENT_TIMESTAMP)
                """);

        assertThatThrownBy(databaseGuard::requireEmptyFunctionalDatabase)
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("users=1");
    }

    @Test
    void rollsBackEveryEntityAndHistoryWhenPersistenceFails() throws IOException {
        LoadedSampleDataDataset loaded = loadCompleteDataset();
        SampleDataDataset valid = loaded.dataset();
        SeedRow<ProjectOdsSeedRow> originalOds = valid.projectOds().get(0);
        SampleDataDataset invalid =
                new SampleDataDataset(
                        valid.users(),
                        valid.addresses(),
                        valid.companies(),
                        valid.npos(),
                        valid.projects(),
                        java.util.List.of(
                                new SeedRow<>(
                                        originalOds.source(),
                                        new ProjectOdsSeedRow("project_one", 999))),
                        valid.companyProjects(),
                        valid.npoReports());
        LoadedSampleDataDataset invalidLoaded =
                new LoadedSampleDataDataset(invalid, loaded.checksum());
        ResolvedAuth0Users auth0Users =
                new ResolvedAuth0Users(
                        Map.of(
                                "company_user", "auth0|company",
                                "npo_user", "auth0|npo"));

        assertThatThrownBy(
                        () ->
                                transactionExecutor.execute(
                                        "integration-rollback", invalidLoaded, auth0Users))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("ODS");

        assertCount("users", 0);
        assertCount("address", 0);
        assertCount("company", 0);
        assertCount("npo", 0);
        assertCount("project", 0);
        assertCount("sample_data_seed_history", 0);
    }

    @Test
    void rejectsChangedDatasetUnderPreviouslyExecutedId() throws IOException {
        LoadedSampleDataDataset original = loadCompleteDataset();
        ResolvedAuth0Users auth0Users =
                new ResolvedAuth0Users(
                        Map.of(
                                "company_user", "auth0|company",
                                "npo_user", "auth0|npo"));
        transactionExecutor.execute("immutable-dataset", original, auth0Users);
        LoadedSampleDataDataset changed =
                new LoadedSampleDataDataset(original.dataset(), "different-checksum");

        assertThatThrownBy(
                        () -> transactionExecutor.execute("immutable-dataset", changed, auth0Users))
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("changed after execution");
    }

    private LoadedSampleDataDataset loadCompleteDataset() throws IOException {
        writeDataset(
                Map.of(
                        SampleDataCsvFile.USERS,
                                """
                                company_user,Company User,company@example.test,company
                                npo_user,NPO User,npo@example.test,npo""",
                        SampleDataCsvFile.ADDRESSES,
                                """
company_address,Rio Grande do Sul,RS,Porto Alegre,Rua A,10,,90000-001
npo_address,Rio Grande do Sul,RS,Porto Alegre,Rua B,20,,90000-002""",
                        SampleDataCsvFile.COMPANIES,
                                """
company_one,company_user,company_address,Company Legal Name,Company Social Name,Company description,,11.222.333/0001-81,51999999999""",
                        SampleDataCsvFile.NPOS,
                                """
npo_one,npo_user,npo_address,NPO One,NPO description,,small,,529.982.247-25,51988888888,true,false,false""",
                        SampleDataCsvFile.PROJECTS,
                                """
project_one,npo_one,Project One,Project description with enough detail for normal application validation,ACTIVE,SOCIAL,1000.00,250.00,2026-01-01,2026-12-31,Education,2026-06,100,Porto Alegre,Expand educational access,45""",
                        SampleDataCsvFile.PROJECT_ODS, "project_one,4",
                        SampleDataCsvFile.COMPANY_PROJECTS,
                                """
company_one,project_one,active,company,2026-01-03T10:00:00,2026-01-04T10:00:00,2026-01-02T10:00:00,2026-02-01T10:00:00""",
                        SampleDataCsvFile.NPO_REPORTS,
                                """
report_one,npo_one,company_one,A sufficiently detailed report reason,OPEN"""));
        return datasetLoader.load(datasetDirectory.toUri().toString());
    }

    private void writeDataset(Map<SampleDataCsvFile, String> rowsByFile) throws IOException {
        for (SampleDataCsvFile file : SampleDataCsvFile.values()) {
            String content = String.join(",", file.headers()) + System.lineSeparator();
            String rows = rowsByFile.get(file);
            if (rows != null && !rows.isBlank()) {
                content += rows.strip() + System.lineSeparator();
            }
            Files.writeString(
                    datasetDirectory.resolve(file.fileName()), content, StandardCharsets.UTF_8);
        }
    }

    private void assertCount(String table, int expected) {
        assertThat(
                        jdbcTemplate.queryForObject(
                                "SELECT COUNT(*) FROM \"" + table + "\"", Integer.class))
                .isEqualTo(expected);
    }
}
