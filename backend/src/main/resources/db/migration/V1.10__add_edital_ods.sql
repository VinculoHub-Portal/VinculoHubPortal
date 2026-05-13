CREATE TABLE edital_ods (
    edital_id BIGINT  NOT NULL,
    ods_id    INTEGER NOT NULL,
    PRIMARY KEY (edital_id, ods_id),
    CONSTRAINT fk_edital_ods_edital FOREIGN KEY (edital_id) REFERENCES edital (id) ON DELETE CASCADE,
    CONSTRAINT fk_edital_ods_ods    FOREIGN KEY (ods_id)    REFERENCES ods   (id) ON DELETE CASCADE
);
