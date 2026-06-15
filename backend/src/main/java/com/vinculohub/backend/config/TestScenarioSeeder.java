/* (C)2026 */
package com.vinculohub.backend.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.test-scenarios.enabled", havingValue = "true")
public class TestScenarioSeeder implements CommandLineRunner {

    private static final String DEFINITIONS = "db/test-scenarios/01_scenario_definitions.sql";
    private static final String PERSISTENCE = "db/test-scenarios/02_scenario_persistence.sql";

    private final JdbcTemplate jdbc;
    private final PlatformTransactionManager transactionManager;

    @Override
    public void run(String... args) {
        new TransactionTemplate(transactionManager)
                .executeWithoutResult(
                        ignored -> {
                            execute(DEFINITIONS);
                            validateEmptyDatabase();
                            validateUsers();
                            execute(PERSISTENCE);
                        });
        log.info("Development and E2E test scenarios loaded.");
    }

    private void validateEmptyDatabase() {
        String populated =
                jdbc.queryForObject("SELECT populated FROM scenario_database_guard", String.class);
        if (!populated.isEmpty()) {
            throw new IllegalStateException(
                    "Test scenarios require an empty functional database. Populated tables: "
                            + populated);
        }
    }

    private void validateUsers() {
        String invalid =
                jdbc.queryForObject(
                        """
                        SELECT string_agg(s.email || ' (expected ' || s.user_type || ', found ' ||
                            COALESCE(u.user_type::text, 'missing') || ')', ', ' ORDER BY s.email)
                        FROM scenario_user s LEFT JOIN users u ON lower(u.email) = lower(s.email)
                        WHERE u.id IS NULL OR u.user_type::text <> s.user_type
                        """,
                        String.class);
        if (invalid != null) {
            throw new IllegalStateException(
                    "Required scenario users are missing or incompatible: " + invalid);
        }
    }

    private void execute(String path) {
        jdbc.execute(
                (ConnectionCallback<Void>)
                        connection -> {
                            ScriptUtils.executeSqlScript(connection, new ClassPathResource(path));
                            return null;
                        });
    }
}
