-- Alinha a tabela project criada em V1__init.sql com o model JPA atual

-- Solta FKs que dependem de project.id
ALTER TABLE IF EXISTS "document"
    DROP CONSTRAINT IF EXISTS document_project_id_fkey;

ALTER TABLE IF EXISTS "project_sdg"
    DROP CONSTRAINT IF EXISTS project_sdg_project_id_fkey;

ALTER TABLE IF EXISTS "company_project"
    DROP CONSTRAINT IF EXISTS company_project_project_id_fkey;

ALTER TABLE IF EXISTS "project_ods"
    DROP CONSTRAINT IF EXISTS fk_project_ods_project;

-- Alinha a tabela project
ALTER TABLE "project"
    ALTER COLUMN "id" TYPE BIGINT,
    ALTER COLUMN "title" SET NOT NULL,
    ALTER COLUMN "description" TYPE VARCHAR(1000),
    ALTER COLUMN "description" SET NOT NULL,
    ALTER COLUMN "npo_id" SET NOT NULL;

-- status sai do enum legado e vira VARCHAR(20), compatível com @Enumerated(EnumType.STRING)
ALTER TABLE "project"
    ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "project"
    ALTER COLUMN "status" TYPE VARCHAR(20)
    USING CASE
        WHEN "status"::text = 'active' THEN 'ACTIVE'
        WHEN "status"::text = 'completed' THEN 'COMPLETED'
        WHEN "status"::text = 'cancelled' THEN 'CANCELLED'
        ELSE 'DRAFT'
    END;

UPDATE "project"
SET "status" = 'DRAFT'
WHERE "status" IS NULL;

ALTER TABLE "project"
    ALTER COLUMN "status" SET DEFAULT 'DRAFT',
    ALTER COLUMN "status" SET NOT NULL;

-- Colunas que referenciam project.id agora precisam acompanhar BIGINT
ALTER TABLE IF EXISTS "document"
    ALTER COLUMN "project_id" TYPE BIGINT USING "project_id"::BIGINT;

ALTER TABLE IF EXISTS "project_sdg"
    ALTER COLUMN "project_id" TYPE BIGINT USING "project_id"::BIGINT;

ALTER TABLE IF EXISTS "company_project"
    ALTER COLUMN "project_id" TYPE BIGINT USING "project_id"::BIGINT;

-- Tabela da ElementCollection do Project
CREATE TABLE IF NOT EXISTS "project_ods" (
    "project_id" BIGINT NOT NULL,
    "ods_code" INTEGER NOT NULL,
    CONSTRAINT "fk_project_ods_project"
        FOREIGN KEY ("project_id")
        REFERENCES "project" ("id")
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "uk_project_ods_project_code"
    ON "project_ods" ("project_id", "ods_code");

-- Índices esperados para project
CREATE INDEX IF NOT EXISTS "idx_project_npo_id"
    ON "project" ("npo_id");

CREATE INDEX IF NOT EXISTS "idx_project_deleted_at"
    ON "project" ("deleted_at");

CREATE INDEX IF NOT EXISTS "idx_project_status"
    ON "project" ("status");

-- Recria FKs que apontam para project.id
ALTER TABLE IF EXISTS "document"
    ADD CONSTRAINT "document_project_id_fkey"
    FOREIGN KEY ("project_id")
    REFERENCES "project" ("id")
    DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE IF EXISTS "project_sdg"
    ADD CONSTRAINT "project_sdg_project_id_fkey"
    FOREIGN KEY ("project_id")
    REFERENCES "project" ("id")
    DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE IF EXISTS "company_project"
    ADD CONSTRAINT "company_project_project_id_fkey"
    FOREIGN KEY ("project_id")
    REFERENCES "project" ("id")
    DEFERRABLE INITIALLY IMMEDIATE;
