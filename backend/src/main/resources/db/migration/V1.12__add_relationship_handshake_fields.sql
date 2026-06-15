-- VNC-02/03/04: extend company_project to support the two-handshake lifecycle.
-- initiator_type identifies which side started the 1st handshake (so the receptor
-- can be determined for accept/reject). The *_confirmed_at columns record each
-- side's confirmation in the 2nd handshake; status only becomes 'active' when both
-- are set. responded_at marks when the 1st handshake was answered; expires_at
-- supports the future 7-day expiry mediation (ADM-06).

CREATE TYPE "initiator_type" AS ENUM (
  'company',
  'npo'
);

ALTER TABLE "company_project"
  ADD COLUMN "initiator_type" initiator_type NOT NULL DEFAULT 'company',
  ADD COLUMN "company_confirmed_at" timestamp,
  ADD COLUMN "npo_confirmed_at" timestamp,
  ADD COLUMN "responded_at" timestamp,
  ADD COLUMN "expires_at" timestamp;
