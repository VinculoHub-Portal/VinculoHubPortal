-- Remove DRAFT: migra registros existentes para ACTIVE e atualiza o default da coluna

UPDATE "project"
SET "status" = 'ACTIVE'
WHERE "status" = 'DRAFT';

ALTER TABLE "project"
    ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
