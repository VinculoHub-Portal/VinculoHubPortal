/* (C)2026 */
package com.vinculohub.backend.database;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class FlywayMigrationTest extends AbstractIntegrationTest {

    @Autowired private JdbcTemplate jdbcTemplate;

    @Autowired private Flyway flyway;

    @Test
    void shouldApplyFlywayMigrationsOnStartup() {
        Integer appliedMigrations =
                jdbcTemplate.queryForObject(
                        "select count(*) from flyway_schema_history where success = true",
                        Integer.class);

        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(appliedMigrations).isNotNull().isGreaterThan(0);
    }

    @Test
    void shouldCreateExpectedTables() {
        List<String> tableNames =
                jdbcTemplate.queryForList(
                        """
                        select table_name
                        from information_schema.tables
                        where table_schema = 'public'
                          and table_type = 'BASE TABLE'
                        """,
                        String.class);

        assertThat(tableNames)
                .contains(
                        "flyway_schema_history",
                        "user",
                        "address",
                        "sdg",
                        "npo",
                        "company",
                        "project",
                        "document",
                        "edital",
                        "project_sdg",
                        "company_project");
    }

    @Test
    void shouldCreateExpectedEnumTypes() {
        List<String> enumTypes =
                jdbcTemplate.queryForList(
                        "select typname from pg_type where typtype = 'e' order by typname",
                        String.class);

        assertThat(enumTypes)
                .containsExactlyInAnyOrder(
                        "npo_size",
                        "user_type",
                        "project_status",
                        "relationship_status",
                        "project_type");
    }
}
