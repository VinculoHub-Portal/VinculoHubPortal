/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SampleDataDatabaseGuard {

    private static final List<String> FUNCTIONAL_TABLES =
            List.of(
                    "users",
                    "address",
                    "company",
                    "npo",
                    "project",
                    "company_project",
                    "npo_report",
                    "document",
                    "edital");

    private final JdbcTemplate jdbcTemplate;

    public void requireEmptyFunctionalDatabase() {
        Map<String, Long> populatedTables = new LinkedHashMap<>();
        for (String table : FUNCTIONAL_TABLES) {
            Long count =
                    jdbcTemplate.queryForObject(
                            "SELECT COUNT(*) FROM \"" + table + "\"", Long.class);
            addIfPopulated(populatedTables, table, count == null ? 0 : count);
        }

        if (!populatedTables.isEmpty()) {
            throw new SampleDataSeedException(
                    "Sample data seed requires an empty functional database; populated tables: "
                            + populatedTables);
        }
    }

    private void addIfPopulated(Map<String, Long> populatedTables, String table, long count) {
        if (count > 0) {
            populatedTables.put(table, count);
        }
    }
}
