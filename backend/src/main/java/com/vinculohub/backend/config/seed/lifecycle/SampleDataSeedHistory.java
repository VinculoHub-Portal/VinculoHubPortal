/* (C)2026 */
package com.vinculohub.backend.config.seed.lifecycle;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sample_data_seed_history")
@Getter
@NoArgsConstructor
public class SampleDataSeedHistory {

    @Id
    @Column(name = "dataset_id", nullable = false, length = 100)
    private String datasetId;

    @Column(nullable = false, length = 64)
    private String checksum;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;

    public SampleDataSeedHistory(String datasetId, String checksum, LocalDateTime executedAt) {
        this.datasetId = datasetId;
        this.checksum = checksum;
        this.executedAt = executedAt;
    }
}
