/* (C)2026 */
package com.vinculohub.backend.database;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

class SchemaValidationTest extends AbstractIntegrationTest {

    @Autowired private JdbcTemplate jdbcTemplate;

    @Test
    void testUserTableStructure() {
        List<String> columns =
                jdbcTemplate.queryForList(
                        """
                        select column_name
                        from information_schema.columns
                        where table_schema = 'public'
                          and table_name = 'user'
                        """,
                        String.class);

        assertThat(columns)
                .contains(
                        "id",
                        "name",
                        "email",
                        "user_type",
                        "created_at",
                        "updated_at",
                        "deleted_at");

        String emailType =
                jdbcTemplate.queryForObject(
                        """
                        select data_type
                        from information_schema.columns
                        where table_schema = 'public'
                          and table_name = 'users'
                          and column_name = 'email'
                        """,
                        String.class);

        assertThat(emailType).isEqualTo("character varying");
    }

    @Test
    void testNpoTableStructure() {
        List<String> columns =
                jdbcTemplate.queryForList(
                        """
                        select column_name
                        from information_schema.columns
                        where table_schema = 'public'
                          and table_name = 'npo'
                        """,
                        String.class);

        assertThat(columns)
                .contains(
                        "id",
                        "name",
                        "user_id",
                        "description",
                        "logo_url",
                        "npo_size",
                        "cnpj",
                        "cpf",
                        "phone",
                        "address_id",
                        "environmental",
                        "social",
                        "governance");
    }

    @Test
    void testCompanyTableStructure() {
        List<String> columns =
                jdbcTemplate.queryForList(
                        """
                        select column_name
                        from information_schema.columns
                        where table_schema = 'public'
                          and table_name = 'company'
                        """,
                        String.class);

        assertThat(columns)
                .contains(
                        "id",
                        "legal_name",
                        "social_name",
                        "user_id",
                        "description",
                        "logo_url",
                        "cnpj",
                        "phone",
                        "address_id");
    }

    @Test
    void testForeignKeyConstraints() {
        List<String> fkColumns =
                jdbcTemplate.queryForList(
                        """
                        select kcu.column_name
                        from information_schema.table_constraints tc
                        join information_schema.key_column_usage kcu
                          on tc.constraint_name = kcu.constraint_name
                         and tc.table_schema = kcu.table_schema
                        where tc.constraint_type = 'FOREIGN KEY'
                          and tc.table_schema = 'public'
                          and tc.table_name = 'npo'
                        """,
                        String.class);

        assertThat(fkColumns).contains("user_id", "address_id");
    }

    @Test
    void testIndexesExist() {
        List<String> indexNames =
                jdbcTemplate.queryForList(
                        """
                        select indexname
                        from pg_indexes
                        where schemaname = 'public'
                          and tablename = 'npo'
                        """,
                        String.class);

        assertThat(indexNames).isNotEmpty();
    }

    @Test
    void testUniqueConstraints() {
        Map<String, List<String>> uniqueConstraints =
                jdbcTemplate.query(
                        """
                        select constraint_name, table_name
                        from information_schema.table_constraints
                        where constraint_type = 'UNIQUE'
                          and table_schema = 'public'
                        order by table_name
                        """,
                        rs -> {
                            Map<String, List<String>> result = new java.util.HashMap<>();
                            while (rs.next()) {
                                result.computeIfAbsent(
                                                rs.getString("table_name"),
                                                key -> new java.util.ArrayList<>())
                                        .add(rs.getString("constraint_name"));
                            }
                            return result;
                        });

        assertThat(uniqueConstraints.get("user")).isNotNull().isNotEmpty();
        assertThat(uniqueConstraints.get("npo")).isNotNull().isNotEmpty();
        assertThat(uniqueConstraints.get("company")).isNotNull().isNotEmpty();
    }
}
