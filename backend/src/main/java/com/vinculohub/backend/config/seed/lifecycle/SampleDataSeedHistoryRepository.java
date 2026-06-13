/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SampleDataSeedHistoryRepository
        extends JpaRepository<SampleDataSeedHistory, String> {}
