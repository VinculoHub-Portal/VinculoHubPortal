/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class SampleDataDatabaseGuardTest {

    private JdbcTemplate jdbcTemplate;
    private SampleDataDatabaseGuard guard;

    @BeforeEach
    void setUp() {
        jdbcTemplate = mock(JdbcTemplate.class);
        guard = new SampleDataDatabaseGuard(jdbcTemplate);
        when(jdbcTemplate.queryForObject(
                        org.mockito.ArgumentMatchers.anyString(),
                        org.mockito.ArgumentMatchers.eq(Long.class)))
                .thenReturn(0L);
    }

    @Test
    void acceptsEmptyFunctionalDatabase() {
        assertThatCode(guard::requireEmptyFunctionalDatabase).doesNotThrowAnyException();
    }

    @Test
    void rejectsDatabaseWithExistingFunctionalData() {
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM \"users\"", Long.class))
                .thenReturn(2L);
        when(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM \"project\"", Long.class))
                .thenReturn(3L);

        assertThatThrownBy(guard::requireEmptyFunctionalDatabase)
                .isInstanceOf(SampleDataSeedException.class)
                .hasMessageContaining("users=2")
                .hasMessageContaining("project=3");
    }
}
