ALTER TABLE project
    ADD COLUMN progress INTEGER NOT NULL DEFAULT 0
        CONSTRAINT chk_project_progress CHECK (progress >= 0 AND progress <= 100);
