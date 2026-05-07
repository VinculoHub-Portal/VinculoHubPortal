ALTER TABLE project ADD COLUMN focus_area VARCHAR(50) NOT NULL DEFAULT '';
ALTER TABLE project ADD COLUMN fundraising_deadline VARCHAR(50);
ALTER TABLE project ADD COLUMN beneficiaries_count INTEGER;
ALTER TABLE project ADD COLUMN location VARCHAR(255);
ALTER TABLE project ADD COLUMN main_objective VARCHAR(600);
