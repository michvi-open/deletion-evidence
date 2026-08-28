#!/usr/bin/env node
/**
 * dataset/generate.js
 *
 * Generates the synthetic Deletion Evidence Record dataset. Deterministic
 * (fixed PRNG seed) so the dataset is reproducible from source rather than
 * committed-and-forgotten. Re-run with `node dataset/generate.js` to
 * regenerate dataset/scenarios/, dataset/invalid/, and dataset/manifest.json.
 *
 * ALL DATA IS SYNTHETIC. No real customer data, no real personal data, no
 * private Michvi data, no client examples, no internal schemas.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { sealRecord } = require('../packages/js/src/hash');
const { validateDER, validateVER } = require('../packages/js/src/validate');

const OUT_DIR = path.join(__dirname, 'scenarios');
const INVALID_DIR = path.join(__dirname, 'invalid');
const MANIFEST_PATH = path.join(__dirname, 'manifest.json');

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32) — reproducible dataset generation.
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260826);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function pickN(arr, n) {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < n && copy.length; i++) {
    const idx = Math.floor(rand() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}
function pickSome(arr, min, max) {
  const n = min + Math.floor(rand() * (max - min + 1));
  return pickN(arr, Math.max(1, Math.min(n, arr.length)));
}
function padId(prefix, n, width) {
  return `${prefix}-${String(n).padStart(width, '0')}`;
}
function isoDate(daysAgoMin, daysAgoMax) {
  const daysAgo = daysAgoMin + Math.floor(rand() * (daysAgoMax - daysAgoMin + 1));
  const d = new Date(Date.UTC(2026, 7, 26)); // fixed reference date for reproducibility
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(Math.floor(rand() * 24), Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
function pseudoRef(prefix, n) {
  return `${prefix}-${(n * 2654435761 % 100000000).toString(16)}`;
}

// ---------------------------------------------------------------------------
// Synthetic vocabularies for scope content (all generic — no real vendors,
// no real organizations, no real people).
// ---------------------------------------------------------------------------
const SYSTEM_POOL = {
  saas: ['saas-app-core-01', 'saas-app-billing-01', 'saas-app-support-01'],
  crm: ['crm-system-01', 'crm-system-eu-02'],
  analytics: ['analytics-platform-01', 'analytics-platform-02', 'analytics-warehouse-01'],
  cloud_storage: ['cloud-storage-primary-01', 'cloud-storage-archive-01', 'cloud-storage-eu-02'],
  marketing: ['marketing-platform-01', 'marketing-platform-email-02'],
  hr: ['hr-system-01', 'hr-system-payroll-02'],
  identity: ['identity-provider-01'],
  backup: ['backup-system-01', 'backup-system-offsite-02'],
  migration_target: ['migration-target-system-01'],
  migration_source: ['migration-source-system-01'],
};
const PROCESSOR_POOL = [
  'subprocessor-hosting-01', 'subprocessor-analytics-01', 'subprocessor-email-01',
  'subprocessor-payments-01', 'subprocessor-support-tooling-01', 'subprocessor-logistics-01',
];
const DATA_CATEGORY_POOL = [
  'customer_account_data', 'employee_hr_record', 'crm_contact_record',
  'usage_analytics_record', 'marketing_contact_record', 'billing_record',
  'support_ticket_record', 'vendor_contract_record', 'migrated_workload_data',
];

// ---------------------------------------------------------------------------
// Scenario family definitions.
// Each family declares: request_type pool, systems pool key(s), whether it
// typically involves processors, and a distribution of execution_status /
// whether a VER chain is attached, matching the family's real-world shape.
// ---------------------------------------------------------------------------
const FAMILIES = [
  { key: 'saas_customer_offboarding', label: 'SaaS customer offboarding', requestTypes: ['CUSTOMER_OFFBOARDING'], systems: ['saas'], withProcessors: true },
  { key: 'employee_offboarding', label: 'Employee offboarding', requestTypes: ['EMPLOYEE_OFFBOARDING'], systems: ['hr', 'identity'], withProcessors: false },
  { key: 'crm_record_deletion', label: 'CRM record deletion', requestTypes: ['DATA_SUBJECT_REQUEST', 'ADMINISTRATIVE_DELETION'], systems: ['crm'], withProcessors: false },
  { key: 'analytics_platform_deletion', label: 'Analytics platform deletion', requestTypes: ['DATA_SUBJECT_REQUEST', 'RETENTION_EXPIRY'], systems: ['analytics'], withProcessors: true },
  { key: 'cloud_storage_deletion', label: 'Cloud-storage deletion', requestTypes: ['ACCOUNT_CLOSURE', 'ADMINISTRATIVE_DELETION'], systems: ['cloud_storage'], withProcessors: false },
  { key: 'marketing_platform_deletion', label: 'Marketing platform deletion', requestTypes: ['DATA_SUBJECT_REQUEST'], systems: ['marketing'], withProcessors: true },
  { key: 'processor_subprocessor_chain', label: 'Processor/subprocessor chain', requestTypes: ['VENDOR_EXIT', 'CONTRACT_TERMINATION'], systems: ['saas', 'crm'], withProcessors: true, forceVer: 'SUBPROCESSOR_PENDING' },
  { key: 'backup_retention', label: 'Backup retention', requestTypes: ['RETENTION_EXPIRY', 'ACCOUNT_CLOSURE'], systems: ['backup'], withProcessors: false },
  { key: 'legal_hold', label: 'Legal hold', requestTypes: ['DATA_SUBJECT_REQUEST', 'CONTRACT_TERMINATION'], systems: ['crm', 'saas'], withProcessors: false, forceExecStatus: 'LEGAL_HOLD', forceVer: 'EXCEPTION_IDENTIFIED' },
  { key: 'account_closure', label: 'Account closure', requestTypes: ['ACCOUNT_CLOSURE'], systems: ['saas', 'crm'], withProcessors: false },
  { key: 'contract_termination', label: 'Contract termination', requestTypes: ['CONTRACT_TERMINATION'], systems: ['saas'], withProcessors: true },
  { key: 'data_migration', label: 'Data migration', requestTypes: ['SYSTEM_MIGRATION'], systems: ['migration_source', 'migration_target'], withProcessors: false },
  { key: 'incomplete_deletion', label: 'Incomplete deletion', requestTypes: ['ACCOUNT_CLOSURE', 'DATA_SUBJECT_REQUEST'], systems: ['saas', 'crm', 'analytics'], withProcessors: false, forceExecStatus: 'PARTIAL' },
  { key: 'delayed_subprocessor_deletion', label: 'Delayed subprocessor deletion', requestTypes: ['VENDOR_EXIT', 'CUSTOMER_OFFBOARDING'], systems: ['saas'], withProcessors: true, forceExecStatus: 'PENDING_SUBPROCESSOR', forceVer: 'SUBPROCESSOR_PENDING' },
  { key: 'deletion_exception', label: 'Deletion exception', requestTypes: ['ADMINISTRATIVE_DELETION', 'ACCOUNT_CLOSURE'], systems: ['crm', 'analytics'], withProcessors: false, forceExecStatus: 'EXCEPTION', forceVer: 'EXCEPTION_IDENTIFIED' },
  { key: 'residual_backup', label: 'Residual backup', requestTypes: ['DATA_SUBJECT_REQUEST', 'RETENTION_EXPIRY'], systems: ['backup', 'cloud_storage'], withProcessors: false, forceResidual: true, forceVer: 'RESIDUAL_COPY_IDENTIFIED' },
  { key: 'disputed_completion', label: 'Disputed completion', requestTypes: ['DATA_SUBJECT_REQUEST'], systems: ['crm', 'marketing'], withProcessors: false, forceExecStatus: 'UNVERIFIED', forceVer: 'UNVERIFIED' },
  { key: 'correction_after_verification', label: 'Correction after verification', requestTypes: ['DATA_SUBJECT_REQUEST', 'ADMINISTRATIVE_DELETION'], systems: ['crm', 'saas'], withProcessors: false, forceVer: 'CORRECTED' },
  { key: 'multi_system_deletion', label: 'Multi-system deletion', requestTypes: ['ACCOUNT_CLOSURE', 'CUSTOMER_OFFBOARDING'], systems: ['saas', 'crm', 'analytics', 'marketing'], withProcessors: true },
  { key: 'vendor_exit', label: 'Vendor exit', requestTypes: ['VENDOR_EXIT'], systems: ['saas', 'cloud_storage'], withProcessors: true },
];

const EXEC_STATUSES = ['COMPLETE', 'PARTIAL', 'PENDING', 'PENDING_SUBPROCESSOR', 'EXCEPTION', 'LEGAL_HOLD', 'UNVERIFIED', 'FAILED'];
const VER_STATUSES = ['CONFIRMED', 'PARTIALLY_CONFIRMED', 'EXCEPTION_IDENTIFIED', 'RESIDUAL_COPY_IDENTIFIED', 'SUBPROCESSOR_PENDING', 'UNVERIFIED', 'CORRECTED'];

const SCENARIOS_PER_FAMILY = 16; // 20 families * 16 = 320 base DERs (> 300 target)

function systemsForFamily(family, n) {
  const pools = family.systems.flatMap((k) => SYSTEM_POOL[k]);
  return pickSome(pools, 1, Math.min(n, pools.length));
}

function buildDER(family, idx, globalIdx) {
  const execStatus = family.forceExecStatus || pick(EXEC_STATUSES.filter((s) => s !== 'LEGAL_HOLD' || family.key === 'legal_hold'));
  const allSystems = systemsForFamily(family, 3);
  let completed, pending;
  if (execStatus === 'COMPLETE') {
    completed = allSystems; pending = [];
  } else if (execStatus === 'FAILED' || execStatus === 'PENDING') {
    completed = []; pending = allSystems;
  } else {
    const splitAt = Math.max(1, Math.floor(allSystems.length / 2));
    completed = allSystems.slice(0, splitAt);
    pending = allSystems.slice(splitAt);
    if (pending.length === 0 && allSystems.length > 1) pending = [allSystems[allSystems.length - 1]];
  }

  const processors = family.withProcessors ? pickSome(PROCESSOR_POOL, 1, 2) : [];
  const requestedAt = isoDate(20, 90);
  const executedAt = execStatus === 'PENDING' || execStatus === 'FAILED' ? null : isoDate(1, 19);
  const recordedAt = isoDate(0, 1);
  const residualDeclared = family.forceResidual ? true : rand() < 0.12;
  const legalHold = execStatus === 'LEGAL_HOLD' ? true : rand() < 0.05;

  const der = {
    record_id: padId('der', globalIdx, 5),
    record_type: 'DER',
    schema_version: '0.1.0',
    timestamp: recordedAt,
    request_context: {
      request_id: padId('req', globalIdx, 5),
      request_type: pick(family.requestTypes),
      requested_at: requestedAt,
      requesting_role: pick(['data_subject', 'customer_admin', 'hr_operations', 'procurement', 'account_owner', 'compliance_operations']),
      requesting_organization_ref: pseudoRef('org-ref', globalIdx),
    },
    data_scope: {
      data_category: pick(DATA_CATEGORY_POOL),
      subject_ref: pseudoRef('subject-ref', globalIdx * 7 + 3),
      scope_description: `${family.label} scenario — synthetic record for dataset testing purposes only.`,
      systems_in_scope: allSystems,
      ...(processors.length ? { processors_in_scope: processors } : {}),
    },
    execution: {
      execution_status: execStatus,
      executed_at: executedAt,
      execution_method_declaration: 'Deletion/data-exit executed via standard operational workflow declaration (synthetic).',
      systems_completed: completed,
      systems_pending: pending,
    },
    residual_state: {
      backup_state: pick(['included in standard 30-day backup rotation', 'excluded from backup — primary system only', 'backup purge pending next rotation cycle']),
      residual_copies_declared: residualDeclared,
      ...(residualDeclared ? { retention_exception: 'Residual copy identified in secondary storage tier (synthetic).' } : {}),
      legal_hold: legalHold,
      ...(processors.length ? { subprocessor_status: family.forceExecStatus === 'PENDING_SUBPROCESSOR' ? 'subprocessor deletion confirmation outstanding' : 'subprocessor deletion confirmed' } : {}),
    },
    evidence_metadata: {
      source_system_id: allSystems[0],
      responsible_party_reference: pseudoRef('party-ref', globalIdx * 3 + 1),
      recorded_at: recordedAt,
      evidence_references: [padId('ticket', globalIdx, 6)],
      canonicalization_method: 'der-ver-canonical-json-v0.1',
      record_hash: '0'.repeat(64), // placeholder — sealed below
    },
  };
  return der;
}

function buildVER(family, der, globalIdx) {
  const status = family.forceVer || pick(VER_STATUSES);
  const ver = {
    record_id: padId('ver', globalIdx, 5),
    record_type: 'VER',
    schema_version: '0.1.0',
    timestamp: isoDate(0, 5),
    linked_record_id: der.record_id,
    linked_record_hash: der.evidence_metadata.record_hash, // set after DER is sealed
    verification_type: pick(['periodic_review', 'subprocessor_confirmation', 'audit_spot_check', 'data_subject_follow_up', 'internal_QA_review']),
    verification_status: status,
    ...(status === 'RESIDUAL_COPY_IDENTIFIED' || status === 'EXCEPTION_IDENTIFIED'
      ? { residual_state_update: 'Residual copy identified during follow-up review (synthetic).', exception_reason: 'Residual/exception condition identified during verification (synthetic).' }
      : {}),
    ...(status === 'SUBPROCESSOR_PENDING' ? { subprocessor_update: 'Subprocessor deletion confirmation still outstanding at time of review (synthetic).' } : {}),
    ...(status === 'CORRECTED' ? { review_note: 'Original DER execution_status corrected following follow-up review (synthetic).' } : {}),
    evidence_metadata: {
      recorded_by_reference: pseudoRef('reviewer-ref', globalIdx * 5 + 2),
      recorded_at: isoDate(0, 5),
      evidence_references: [padId('review', globalIdx, 6)],
      canonicalization_method: 'der-ver-canonical-json-v0.1',
      record_hash: '0'.repeat(64),
    },
  };
  return ver;
}

// VER-attach probability per family: families with a forced VER outcome always
// get one; others get a VER about 35% of the time (routine verification).
function shouldAttachVer(family) {
  if (family.forceVer) return true;
  return rand() < 0.35;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(INVALID_DIR, { recursive: true });

  const manifest = { schema_version: '0.1.0', generated_from: 'dataset/generate.js', families: [], scenarios: [], invalid: [] };
  let globalIdx = 0;

  for (const family of FAMILIES) {
    const familyEntry = { key: family.key, label: family.label, request_types: family.requestTypes, scenario_count: 0, with_ver_count: 0 };

    for (let i = 0; i < SCENARIOS_PER_FAMILY; i++) {
      globalIdx += 1;
      let der = buildDER(family, i, globalIdx);
      der = await sealRecord(der);

      const derValidation = validateDER(der);
      if (!derValidation.valid) {
        throw new Error(`Generated invalid DER ${der.record_id}: ${JSON.stringify(derValidation.errors)}`);
      }

      const derFile = `${family.key}-${String(i + 1).padStart(2, '0')}-der.json`;
      fs.writeFileSync(path.join(OUT_DIR, derFile), JSON.stringify(der, null, 2) + '\n');

      const scenarioEntry = {
        scenario_id: `${family.key}-${String(i + 1).padStart(2, '0')}`,
        family: family.key,
        der_file: `scenarios/${derFile}`,
        der_record_id: der.record_id,
        execution_status: der.execution.execution_status,
        has_ver: false,
      };

      if (shouldAttachVer(family)) {
        let ver = buildVER(family, der, globalIdx);
        ver.linked_record_hash = der.evidence_metadata.record_hash;
        ver = await sealRecord(ver);

        const verValidation = validateVER(ver);
        if (!verValidation.valid) {
          throw new Error(`Generated invalid VER ${ver.record_id}: ${JSON.stringify(verValidation.errors)}`);
        }

        const verFile = `${family.key}-${String(i + 1).padStart(2, '0')}-ver.json`;
        fs.writeFileSync(path.join(OUT_DIR, verFile), JSON.stringify(ver, null, 2) + '\n');

        scenarioEntry.has_ver = true;
        scenarioEntry.ver_file = `scenarios/${verFile}`;
        scenarioEntry.ver_record_id = ver.record_id;
        scenarioEntry.verification_status = ver.verification_status;
        familyEntry.with_ver_count += 1;
      }

      manifest.scenarios.push(scenarioEntry);
      familyEntry.scenario_count += 1;
    }

    manifest.families.push(familyEntry);
  }

  // ---------------------------------------------------------------------
  // Invalid examples for validator testing (A4, A13). Each is deliberately
  // broken in exactly one documented way.
  // ---------------------------------------------------------------------
  const validSample = JSON.parse(
    fs.readFileSync(path.join(OUT_DIR, path.basename(manifest.scenarios[0].der_file)), 'utf8')
  );

  const invalidCases = [
    {
      id: 'inv-missing-required-field',
      reason: 'evidence_metadata.source_system_id is missing (required field).',
      build: (rec) => { const c = structuredClone(rec); delete c.evidence_metadata.source_system_id; return c; },
    },
    {
      id: 'inv-unknown-field',
      reason: 'Top-level unknown field "internal_notes" present; additionalProperties is false.',
      build: (rec) => { const c = structuredClone(rec); c.internal_notes = 'not permitted'; return c; },
    },
    {
      id: 'inv-bad-enum-execution-status',
      reason: 'execution.execution_status is "DONE", not a value in the closed vocabulary.',
      build: (rec) => { const c = structuredClone(rec); c.execution.execution_status = 'DONE'; return c; },
    },
    {
      id: 'inv-bad-record-type',
      reason: 'record_type is "der" (lowercase) instead of the required constant "DER".',
      build: (rec) => { const c = structuredClone(rec); c.record_type = 'der'; return c; },
    },
    {
      id: 'inv-malformed-hash',
      reason: 'evidence_metadata.record_hash is not a 64-char lowercase hex string.',
      build: (rec) => { const c = structuredClone(rec); c.record_hash_note = undefined; c.evidence_metadata.record_hash = 'not-a-real-hash'; return c; },
    },
    {
      id: 'inv-bad-timestamp',
      reason: 'timestamp is not RFC 3339 (missing time component).',
      build: (rec) => { const c = structuredClone(rec); c.timestamp = '2026-08-01'; return c; },
    },
    {
      id: 'inv-wrong-schema-version',
      reason: 'schema_version is "0.2.0", which does not match the required constant "0.1.0".',
      build: (rec) => { const c = structuredClone(rec); c.schema_version = '0.2.0'; return c; },
    },
    {
      id: 'inv-empty-systems-in-scope',
      reason: 'data_scope.systems_in_scope is an empty array; minItems is 1.',
      build: (rec) => { const c = structuredClone(rec); c.data_scope.systems_in_scope = []; return c; },
    },
    {
      id: 'inv-duplicate-systems',
      reason: 'data_scope.systems_in_scope contains a duplicate entry; uniqueItems is true.',
      build: (rec) => { const c = structuredClone(rec); c.data_scope.systems_in_scope = [c.data_scope.systems_in_scope[0], c.data_scope.systems_in_scope[0]]; return c; },
    },
    {
      id: 'inv-missing-request-context-object',
      reason: 'request_context is entirely missing (required top-level object).',
      build: (rec) => { const c = structuredClone(rec); delete c.request_context; return c; },
    },
    {
      id: 'inv-ver-tampered-parent-link',
      reason: 'VER linked_record_hash does not match its parent DER\'s actual hash (simulated tamper).',
      isVer: true,
      build: () => {
        const parentHash = validSample.evidence_metadata.record_hash;
        const tampered = parentHash.slice(0, -4) + 'dead';
        return {
          record_id: 'ver-inv-001',
          record_type: 'VER',
          schema_version: '0.1.0',
          timestamp: '2026-08-10T00:00:00Z',
          linked_record_id: validSample.record_id,
          linked_record_hash: tampered,
          verification_type: 'periodic_review',
          verification_status: 'CONFIRMED',
          evidence_metadata: {
            recorded_at: '2026-08-10T00:00:00Z',
            canonicalization_method: 'der-ver-canonical-json-v0.1',
            record_hash: '1'.repeat(64),
          },
        };
      },
    },
    {
      id: 'inv-ver-bad-verification-status',
      reason: 'VER verification_status is "DONE", not a value in the closed vocabulary.',
      isVer: true,
      build: () => ({
        record_id: 'ver-inv-002',
        record_type: 'VER',
        schema_version: '0.1.0',
        timestamp: '2026-08-10T00:00:00Z',
        linked_record_id: validSample.record_id,
        linked_record_hash: validSample.evidence_metadata.record_hash,
        verification_type: 'periodic_review',
        verification_status: 'DONE',
        evidence_metadata: {
          recorded_at: '2026-08-10T00:00:00Z',
          canonicalization_method: 'der-ver-canonical-json-v0.1',
          record_hash: '1'.repeat(64),
        },
      }),
    },
  ];

  for (const c of invalidCases) {
    const record = c.build(validSample);
    const filePath = path.join(INVALID_DIR, `${c.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2) + '\n');
    manifest.invalid.push({ id: c.id, file: `invalid/${c.id}.json`, record_type: c.isVer ? 'VER' : 'DER', reason: c.reason });
  }

  manifest.total_scenarios = manifest.scenarios.length;
  manifest.total_der = manifest.scenarios.length;
  manifest.total_ver = manifest.scenarios.filter((s) => s.has_ver).length;
  manifest.total_invalid_examples = manifest.invalid.length;
  manifest.note = 'All records are entirely synthetic. No real customer data, personal data, or Michvi confidential material is present in this dataset.';

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Generated ${manifest.total_der} DER, ${manifest.total_ver} linked VER, ${manifest.total_invalid_examples} invalid examples.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
