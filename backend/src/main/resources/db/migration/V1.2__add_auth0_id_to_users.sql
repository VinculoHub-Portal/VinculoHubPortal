ALTER TABLE "users"
ADD COLUMN "auth0_id" varchar(255);

ALTER TABLE "users"
ADD CONSTRAINT "users_auth0_id_key" UNIQUE ("auth0_id");
