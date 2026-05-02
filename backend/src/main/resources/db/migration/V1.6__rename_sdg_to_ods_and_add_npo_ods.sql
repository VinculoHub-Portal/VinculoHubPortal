-- Renomeia o catálogo SDG para ODS e atualiza os metadados necessários.

ALTER TABLE IF EXISTS "sdg"
    RENAME TO "ods";

ALTER TABLE IF EXISTS "ods"
    ADD COLUMN IF NOT EXISTS "description" varchar(255);

INSERT INTO "ods" ("id", "name", "description") VALUES
    (1, 'Erradicação da Pobreza', 'Erradicar a pobreza em todas as formas, em todos os lugares.'),
    (2, 'Fome Zero e Agricultura Sustentável', 'Acabar com a fome, alcançar segurança alimentar e nutrição.'),
    (3, 'Saúde e Bem-Estar', 'Assegurar uma vida saudável e promover o bem-estar.'),
    (4, 'Educação de Qualidade', 'Assegurar educação inclusiva e equitativa de qualidade.'),
    (5, 'Igualdade de Gênero', 'Alcançar a igualdade de gênero e empoderar todas as mulheres.'),
    (6, 'Água Potável e Saneamento', 'Garantir disponibilidade e gestão sustentável da água.'),
    (7, 'Energia Limpa e Acessível', 'Assegurar acesso confiável, sustentável e moderno à energia.'),
    (8, 'Trabalho Decente e Crescimento Econômico', 'Promover crescimento econômico sustentado e emprego pleno.'),
    (9, 'Indústria, Inovação e Infraestrutura', 'Construir infraestrutura resiliente e promover inovação.'),
    (10, 'Redução das Desigualdades', 'Reduzir a desigualdade dentro dos países e entre eles.'),
    (11, 'Cidades e Comunidades Sustentáveis', 'Tornar as cidades inclusivas, seguras, resilientes e sustentáveis.'),
    (12, 'Consumo e Produção Responsáveis', 'Assegurar padrões de produção e consumo sustentáveis.'),
    (13, 'Ação Contra a Mudança Global do Clima', 'Adotar medidas urgentes contra a mudança climática.'),
    (14, 'Vida na Água', 'Conservar e usar de forma sustentável os oceanos.'),
    (15, 'Vida Terrestre', 'Proteger, recuperar e promover o uso sustentável dos ecossistemas.'),
    (16, 'Paz, Justiça e Instituições Eficazes', 'Promover sociedades pacíficas e inclusivas.'),
    (17, 'Parcerias e Meios de Implementação', 'Fortalecer os meios de implementação e revitalizar parcerias.')
ON CONFLICT ("id") DO UPDATE SET
    "name" = EXCLUDED."name",
    "description" = EXCLUDED."description";

ALTER TABLE IF EXISTS "project_ods"
    RENAME COLUMN "ods_code" TO "ods_id";

DROP INDEX IF EXISTS "uk_project_ods_project_code";

ALTER TABLE IF EXISTS "project_ods"
    DROP CONSTRAINT IF EXISTS "fk_project_ods_project";

ALTER TABLE IF EXISTS "project_ods"
    ADD CONSTRAINT "fk_project_ods_project"
        FOREIGN KEY ("project_id")
        REFERENCES "project" ("id")
        ON DELETE CASCADE;

ALTER TABLE IF EXISTS "project_ods"
    ADD CONSTRAINT "fk_project_ods_ods"
        FOREIGN KEY ("ods_id")
        REFERENCES "ods" ("id")
        ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "uk_project_ods_project_code"
    ON "project_ods" ("project_id", "ods_id");

INSERT INTO "project_ods" ("project_id", "ods_id")
SELECT "project_id", "sdg_id"
FROM "project_sdg"
ON CONFLICT DO NOTHING;

DROP TABLE IF EXISTS "project_sdg";
