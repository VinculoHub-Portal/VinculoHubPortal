CREATE TABLE sample_data_seed_history (
    dataset_id VARCHAR(100) PRIMARY KEY,
    checksum VARCHAR(64) NOT NULL,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
