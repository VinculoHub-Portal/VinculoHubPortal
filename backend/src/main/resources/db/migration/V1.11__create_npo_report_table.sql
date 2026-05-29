CREATE TABLE npo_report (
    id BIGSERIAL PRIMARY KEY,
    npo_id INTEGER NOT NULL,
    reporter_company_id INTEGER NOT NULL,
    reporter_user_id INTEGER NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_npo_report_npo FOREIGN KEY (npo_id) REFERENCES npo (id),
    CONSTRAINT fk_npo_report_company FOREIGN KEY (reporter_company_id) REFERENCES company (id),
    CONSTRAINT fk_npo_report_user FOREIGN KEY (reporter_user_id) REFERENCES users (id)
);

CREATE INDEX idx_npo_report_npo_id ON npo_report (npo_id);
CREATE INDEX idx_npo_report_reporter_company_id ON npo_report (reporter_company_id);
CREATE INDEX idx_npo_report_status ON npo_report (status);
CREATE INDEX idx_npo_report_created_at ON npo_report (created_at);
