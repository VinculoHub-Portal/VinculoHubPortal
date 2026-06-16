/* (C)2026 */
package com.vinculohub.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.vinculohub.backend.database.AbstractIntegrationTest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;

class TestScenarioSeederIntegrationTest extends AbstractIntegrationTest {

    @Autowired private PlatformTransactionManager transactionManager;

    @Autowired(required = false)
    private TestScenarioSeeder configuredSeeder;

    @AfterEach
    void cleanUp() {
        reset();
    }

    @Test
    void coversUsersCatalogReuseGuardsAndRollback() {
        TestScenarioSeeder seeder = new TestScenarioSeeder(jdbc, transactionManager);
        reset();
        assertThat(configuredSeeder).isNull();
        assertThat(tableCounts("users", "company", "npo", "project")).containsOnly(0);

        seeder.run();
        assertThat(tableCounts("users", "company", "npo", "project", "company_project"))
                .containsExactly(5, 3, 2, 4, 4);
        assertThat(catalogWasPersistedCorrectly()).isTrue();
        seeder.run();
        assertThat(tableCounts("users", "company", "npo", "project", "npo_report"))
                .containsExactly(5, 3, 2, 4, 2);

        reset();
        insertUser(
                "E2E Empty Company",
                "e2e.company.empty@vinculohub.test",
                "auth0|6a3080b7cd92f499f988ff9e",
                "company");
        insertUser("E2E Projects NPO", "e2e.npo.projects@vinculohub.test", null, "npo");
        seeder.run();
        assertThat(scenarioUserAuth0("e2e.npo.projects@vinculohub.test"))
                .isEqualTo("auth0|6a308086cd92f499f988ff7b");
        assertThat(tableCounts("users", "company_project")).containsExactly(5, 4);

        reset();
        insertUser("Wrong Type", "e2e.npo.projects@vinculohub.test", "auth0|wrong", "admin");
        assertThatThrownBy(() -> seeder.run())
                .hasMessageContaining("e2e.npo.projects@vinculohub.test")
                .hasMessageContaining("expected type=npo");

        reset();
        insertUser("Wrong Auth", "e2e.company.active@vinculohub.test", "auth0|wrong", "company");
        assertThatThrownBy(() -> seeder.run())
                .hasMessageContaining("e2e.company.active@vinculohub.test")
                .hasMessageContaining("auth0|wrong");

        reset();
        jdbc.update("INSERT INTO address (city) VALUES ('Existing')");
        assertThatThrownBy(() -> seeder.run()).hasMessageContaining("address");
        assertThat(tableCounts("users", "address", "company")).containsExactly(0, 1, 0);

        reset();
        insertUser("E2E Projects NPO", "e2e.npo.projects@vinculohub.test", null, "npo");
        addFailingProjectTrigger();
        assertThatThrownBy(() -> seeder.run())
                .rootCause()
                .hasMessageContaining("forced project failure");
        assertThat(scenarioUserAuth0("e2e.npo.projects@vinculohub.test")).isNull();
        assertThat(tableCounts("users", "company", "npo", "project")).containsExactly(1, 0, 0, 0);
    }

    private boolean catalogWasPersistedCorrectly() {
        return Boolean.TRUE.equals(
                jdbc.queryForObject(
                        "SELECT (SELECT array_agg(ods_id ORDER BY ods_id) FROM project_ods) ="
                                + " ARRAY[1,4,11,13] AND (SELECT array_agg(status::text ORDER BY"
                                + " status::text) FROM company_project) ="
                                + " ARRAY['active','active','negotiation','pending'] AND (SELECT"
                                + " bool_and(r.reporter_user_id = c.user_id) FROM npo_report r JOIN"
                                + " company c ON c.id = r.reporter_company_id)",
                        Boolean.class));
    }

    private String scenarioUserAuth0(String email) {
        return jdbc.queryForObject(
                "SELECT auth0_id FROM users WHERE lower(email) = lower(?)", String.class, email);
    }

    private void addFailingProjectTrigger() {
        jdbc.execute(
                "CREATE FUNCTION fail_test_scenario_project() RETURNS trigger LANGUAGE plpgsql "
                        + "AS $$ BEGIN RAISE EXCEPTION 'forced project failure'; END $$");
        jdbc.execute(
                "CREATE TRIGGER fail_test_scenario_project BEFORE INSERT ON project "
                        + "FOR EACH ROW EXECUTE FUNCTION fail_test_scenario_project()");
    }

    private void reset() {
        jdbc.execute("DROP TRIGGER IF EXISTS fail_test_scenario_project ON project");
        jdbc.execute("DROP FUNCTION IF EXISTS fail_test_scenario_project()");
        truncateFunctionalTables();
    }

    private void insertUser(String name, String email, String auth0Id, String userType) {
        jdbc.update(
                "INSERT INTO users (name, email, auth0_id, user_type) VALUES (?, ?, ?,"
                        + " ?::user_type)",
                name,
                email,
                auth0Id,
                userType);
    }
}
