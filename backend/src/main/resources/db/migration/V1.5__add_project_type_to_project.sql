-- Adiciona coluna project_type à tabela project como VARCHAR(30) nullable
-- Projetos existentes não possuem tipo, portanto a coluna permite NULL

ALTER TABLE "project"
    ADD COLUMN IF NOT EXISTS "project_type" VARCHAR(30);
