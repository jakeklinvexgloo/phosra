-- Phosra Compliance Attestation Service: CSAM reporting, library filter compliance, algorithmic audit
CREATE TABLE IF NOT EXISTS compliance_attestations (
    id UUID PRIMARY KEY,
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    rule_category VARCHAR(50) NOT NULL,
    platform_id VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_review',
    evidence JSONB NOT NULL DEFAULT '{}',
    attested_at TIMESTAMPTZ,
    next_review_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_attestations_family ON compliance_attestations(family_id);
CREATE INDEX idx_compliance_attestations_status ON compliance_attestations(status);
