-- 038: Referral tracking & gamification
-- Adds referred_by tracking, claimed_by_phone on invite claims, and investor_badges

-- 1a. Add referred_by to investor_approved_phones
ALTER TABLE investor_approved_phones
  ADD COLUMN IF NOT EXISTS referred_by TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_investor_phones_referred_by
  ON investor_approved_phones(referred_by) WHERE referred_by != '';

-- 1b. Add claimed_by_phone to investor_invite_claims
ALTER TABLE investor_invite_claims
  ADD COLUMN IF NOT EXISTS claimed_by_phone TEXT NOT NULL DEFAULT '';

-- Backfill claimed_by_phone from name column (phone was stored there)
UPDATE investor_invite_claims
SET claimed_by_phone = name
WHERE claimed_by_phone = '' AND name LIKE '+%';

-- 1c. Backfill referred_by from existing invite data
UPDATE investor_approved_phones ap
SET referred_by = il.created_by
FROM investor_invite_claims ic
JOIN investor_invite_links il ON il.code = ic.invite_code
WHERE ic.claimed_by_phone = ap.phone_e164
  AND ap.referred_by = '';

-- 1d. Create investor_badges table
CREATE TABLE IF NOT EXISTS investor_badges (
    id         BIGSERIAL PRIMARY KEY,
    phone_e164 TEXT NOT NULL,
    badge_key  TEXT NOT NULL,
    earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (phone_e164, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_investor_badges_phone
  ON investor_badges(phone_e164);
