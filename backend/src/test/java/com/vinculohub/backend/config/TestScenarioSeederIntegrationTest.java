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
    void coversCatalogGuardsAndRollback() {
        TestScenarioSeeder seeder = new TestScenarioSeeder(jdbc, transactionManager);
        reset();
        assertThat(configuredSeeder).isNull();
        assertThat(tableCounts("company", "npo", "project")).containsOnly(0);

        insertUsers();
        seeder.run();
        assertThat(tableCounts("company", "npo", "project", "company_project", "npo_report"))
                .containsExactly(3, 2, 4, 4, 2);
        assertThat(
                        jdbc.queryForObject(
                                "SELECT (SELECT array_agg(ods_id ORDER BY ods_id) FROM project_ods)"
                                    + " = ARRAY[1,4,11,13] AND (SELECT array_agg(status::text ORDER"
                                    + " BY status::text) FROM company_project) ="
                                    + " ARRAY['active','active','negotiation','pending'] AND"
                                    + " (SELECT bool_and(r.reporter_user_id = c.user_id) FROM"
                                    + " npo_report r JOIN company c ON c.id ="
                                    + " r.reporter_company_id)",
                                Boolean.class))
                .isTrue();

        reset();
        insertUsers();
        jdbc.update("DELETE FROM users WHERE email = 'e2e.npo.reported@vinculohub.test'");
        assertThatThrownBy(() -> seeder.run())
                .hasMessageContaining("e2e.npo.reported@vinculohub.test");
        reset();
        insertUsers();
        jdbc.update(
                "UPDATE users SET user_type = 'admin' "
                        + "WHERE email = 'e2e.npo.projects@vinculohub.test'");
        assertThatThrownBy(() -> seeder.run()).hasMessageContaining("expected npo, found admin");
        reset();
        insertUsers();
        jdbc.update("INSERT INTO address (city) VALUES ('Existing')");
        assertThatThrownBy(() -> seeder.run()).hasMessageContaining("address");

        reset();
        insertUsers();
        jdbc.execute(
                "CREATE FUNCTION fail_test_scenario_project() RETURNS trigger LANGUAGE plpgsql "
                        + "AS $$ BEGIN RAISE EXCEPTION 'forced project failure'; END $$");
        jdbc.execute(
                "CREATE TRIGGER fail_test_scenario_project BEFORE INSERT ON project "
                        + "FOR EACH ROW EXECUTE FUNCTION fail_test_scenario_project()");
        assertThatThrownBy(() -> seeder.run())
                .rootCause()
                .hasMessageContaining("forced project failure");
        assertThat(tableCounts("company", "npo", "project")).containsOnly(0);
    }

    private void reset() {
        jdbc.execute("DROP TRIGGER IF EXISTS fail_test_scenario_project ON project");
        jdbc.execute("DROP FUNCTION IF EXISTS fail_test_scenario_project()");
        truncateFunctionalTables();
    }

    private void insertUsers() {
        jdbc.execute(
                """
INSERT INTO users (name, email, auth0_id, user_type) VALUES
('Empty Company', 'e2e.company.empty@vinculohub.test', 'auth0|empty', 'company'),
('Active Company', 'e2e.company.active@vinculohub.test', 'auth0|active', 'company'),
('Multiple Company', 'e2e.company.multiple@vinculohub.test', 'auth0|multiple', 'company'),
('Projects NPO', 'e2e.npo.projects@vinculohub.test', 'auth0|projects', 'npo'),
('Reported NPO', 'e2e.npo.reported@vinculohub.test', 'auth0|reported', 'npo')
""");
    }
}
