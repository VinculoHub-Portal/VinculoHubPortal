-- Remover foreign keys que referenciam "user"
ALTER TABLE "npo" DROP CONSTRAINT IF EXISTS npo_user_id_fkey;
ALTER TABLE "company" DROP CONSTRAINT IF EXISTS company_user_id_fkey;

-- Renomear tabela "user" para "users"
ALTER TABLE "user" RENAME TO "users";

-- Recriar foreign keys apontando para "users"
ALTER TABLE "npo" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE "company" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;