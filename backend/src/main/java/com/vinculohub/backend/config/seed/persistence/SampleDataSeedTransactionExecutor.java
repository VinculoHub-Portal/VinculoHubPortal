/* (C)2026 */
package com.vinculohub.backend.config.seed.persistence;

import com.vinculohub.backend.config.seed.auth0.ResolvedAuth0Users;
import com.vinculohub.backend.config.seed.dataset.LoadedSampleDataDataset;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedException;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistory;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedHistoryRepository;
import com.vinculohub.backend.config.seed.lifecycle.SampleDataSeedResult;
import java.sql.PreparedStatement;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class SampleDataSeedTransactionExecutor {

    private static final long SEED_LOCK_ID = 8_672_026_061_401L;

    private final JdbcTemplate jdbcTemplate;
    private final SampleDataSeedHistoryRepository historyRepository;
    private final SampleDataDatabaseGuard databaseGuard;
    private final CoreSampleDataPersister corePersister;
    private final DomainRelationSampleDataPersister relationPersister;

    @Transactional
    public SampleDataSeedResult execute(
            String datasetId,
            LoadedSampleDataDataset loaded,
            ResolvedAuth0Users resolvedAuth0Users) {
        acquireSeedLock();

        SampleDataSeedHistory existing = historyRepository.findById(datasetId).orElse(null);
        if (existing != null) {
            requireMatchingChecksum(datasetId, existing.getChecksum(), loaded.checksum());
            return SampleDataSeedResult.skipped(loaded.checksum());
        }

        databaseGuard.requireEmptyFunctionalDatabase();
        PersistedSampleData persisted = corePersister.persist(loaded.dataset(), resolvedAuth0Users);
        relationPersister.persist(loaded.dataset(), persisted);
        historyRepository.save(
                new SampleDataSeedHistory(datasetId, loaded.checksum(), LocalDateTime.now()));
        log.info(
                "Sample data entities persisted | datasetId={} users={} addresses={} companies={} "
                        + "npos={} projects={} companyProjects={} npoReports={}",
                datasetId,
                persisted.users().size(),
                persisted.addresses().size(),
                persisted.companies().size(),
                persisted.npos().size(),
                persisted.projects().size(),
                loaded.dataset().companyProjects().size(),
                loaded.dataset().npoReports().size());
        return new SampleDataSeedResult(loaded.checksum());
    }

    static void requireMatchingChecksum(
            String datasetId, String registeredChecksum, String currentChecksum) {
        if (!registeredChecksum.equals(currentChecksum)) {
            throw new SampleDataSeedException(
                    "Sample data dataset '%s' changed after execution; use a new dataset id."
                            .formatted(datasetId));
        }
    }

    private void acquireSeedLock() {
        jdbcTemplate.execute(
                (ConnectionCallback<Void>)
                        connection -> {
                            try (PreparedStatement statement =
                                    connection.prepareStatement(
                                            "SELECT pg_advisory_xact_lock(?)")) {
                                statement.setLong(1, SEED_LOCK_ID);
                                statement.execute();
                            }
                            return null;
                        });
    }
}
