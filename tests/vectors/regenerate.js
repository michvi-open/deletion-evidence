#!/usr/bin/env node
/**
 * tests/vectors/regenerate.js
 *
 * Regenerates the fixed test vectors. Running this should produce
 * byte-identical output to what's committed — if it doesn't, the
 * canonicalization or hashing implementation has changed behavior.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { canonicalize } = require('../../packages/js/src/canonicalize');
const { computeRecordHash } = require('../../packages/js/src/hash');

const DER_FIXTURE = {
  record_id: 'der-vector-0001',
  record_type: 'DER',
  schema_version: '0.1.0',
  timestamp: '2026-01-15T12:00:00Z',
  request_context: {
    request_id: 'req-vector-0001',
    request_type: 'ACCOUNT_CLOSURE',
    requested_at: '2026-01-10T09:00:00Z',
    requesting_role: 'account_owner',
    requesting_organization_ref: 'org-ref-vector-01',
  },
  data_scope: {
    data_category: 'customer_account_data',
    subject_ref: 'subject-ref-vector-01',
    scope_description: 'Fixed test vector — deterministic canonicalization/hash example.',
    systems_in_scope: ['crm-system-01', 'saas-app-core-01'],
  },
  execution: {
    execution_status: 'COMPLETE',
    executed_at: '2026-01-14T08:00:00Z',
    execution_method_declaration: 'Deletion executed via standard offboarding workflow.',
    systems_completed: ['crm-system-01', 'saas-app-core-01'],
    systems_pending: [],
  },
  residual_state: {
    backup_state: 'included in standard 30-day backup rotation',
    residual_copies_declared: false,
    legal_hold: false,
  },
  evidence_metadata: {
    source_system_id: 'crm-system-01',
    responsible_party_reference: 'party-ref-vector-01',
    recorded_at: '2026-01-15T12:00:00Z',
    evidence_references: ['ticket-000001'],
    canonicalization_method: 'der-ver-canonical-json-v0.1',
    record_hash: 'PLACEHOLDER',
  },
};

async function main() {
  const canonical = canonicalize(DER_FIXTURE);
  const hash = await computeRecordHash(DER_FIXTURE);
  const der = JSON.parse(JSON.stringify(DER_FIXTURE));
  der.evidence_metadata.record_hash = hash;

  const VER_FIXTURE = {
    record_id: 'ver-vector-0001',
    record_type: 'VER',
    schema_version: '0.1.0',
    timestamp: '2026-02-01T09:00:00Z',
    linked_record_id: der.record_id,
    linked_record_hash: hash,
    verification_type: 'periodic_review',
    verification_status: 'CONFIRMED',
    evidence_metadata: {
      recorded_by_reference: 'reviewer-ref-vector-01',
      recorded_at: '2026-02-01T09:00:00Z',
      evidence_references: ['review-000001'],
      canonicalization_method: 'der-ver-canonical-json-v0.1',
      record_hash: 'PLACEHOLDER',
    },
  };
  const verCanonical = canonicalize(VER_FIXTURE);
  const verHash = await computeRecordHash(VER_FIXTURE);
  const ver = JSON.parse(JSON.stringify(VER_FIXTURE));
  ver.evidence_metadata.record_hash = verHash;

  fs.writeFileSync(path.join(__dirname, 'der-vector-0001.json'), JSON.stringify(der, null, 2) + '\n');
  fs.writeFileSync(path.join(__dirname, 'der-vector-0001.canonical.txt'), canonical + '\n');
  fs.writeFileSync(path.join(__dirname, 'ver-vector-0001.json'), JSON.stringify(ver, null, 2) + '\n');
  fs.writeFileSync(path.join(__dirname, 'ver-vector-0001.canonical.txt'), verCanonical + '\n');

  console.log('DER hash:', hash);
  console.log('VER hash:', verHash);
}

main();
