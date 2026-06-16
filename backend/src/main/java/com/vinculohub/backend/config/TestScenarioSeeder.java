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
        boolean loaded =
                Boolean.TRUE.equals(
                        new TransactionTemplate(transactionManager)
                                .execute(
                                        ignored -> {
                                            execute(DEFINITIONS);
                                            ensureUsers();
                                            if (hasFunctionalData()) {
                                                validateExistingCatalog();
                                                log.info(
                                                        "Development and E2E test scenarios already"
                                                                + " loaded.");
                                                return false;
                                            }
                                            execute(PERSISTENCE);
                                            return true;
                                        }));
        if (loaded) {
            log.info("Development and E2E test scenarios loaded.");
        }
    }

    private boolean hasFunctionalData() {
        String populated =
                jdbc.queryForObject("SELECT populated FROM scenario_database_guard", String.class);
        return !populated.isEmpty();
    }

    private void validateExistingCatalog() {
        String mismatches =
                jdbc.queryForObject("SELECT mismatches FROM scenario_catalog_guard", String.class);
        if (!mismatches.isEmpty()) {
            throw new IllegalStateException(
                    "Functional database does not match test scenarios. Mismatches: " + mismatches);
        }
    }

    private void ensureUsers() {
        validateUsersWithExistingEmails();
        jdbc.update(
                """
                INSERT INTO users (name, email, user_type, auth0_id, created_at, updated_at)
                SELECT s.name, s.email, s.user_type::user_type, s.auth0_id, now(), now()
                FROM scenario_user s
                WHERE NOT EXISTS (SELECT 1 FROM users u WHERE lower(u.email) = lower(s.email))
                """);
        jdbc.update(
                """
                UPDATE users u SET auth0_id = s.auth0_id, updated_at = now()
                FROM scenario_user s
                WHERE lower(u.email) = lower(s.email)
                  AND u.user_type::text = s.user_type
                  AND u.auth0_id IS NULL
                """);
    }

    private void validateUsersWithExistingEmails() {
        String invalid =
                jdbc.queryForObject(
                        """
                        SELECT string_agg(s.email || ' (expected type=' || s.user_type ||
                            ', auth0_id=' || s.auth0_id || ', found type=' ||
                            COALESCE(u.user_type::text, 'missing') || ', auth0_id=' ||
                            COALESCE(u.auth0_id, 'missing') || ')', ', ' ORDER BY s.email)
                        FROM scenario_user s JOIN users u ON lower(u.email) = lower(s.email)
                        WHERE u.user_type::text <> s.user_type
                           OR (u.auth0_id IS NOT NULL AND u.auth0_id <> s.auth0_id)
                        """,
                        String.class);
        if (invalid != null) {
            throw new IllegalStateException("Required scenario users are incompatible: " + invalid);
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
