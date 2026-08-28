'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDER, validateVER } = require('../packages/js/src/validate');

function baseDER(overrides = {}) {
  return {
    record_id: 'der-vocab-test',
    record_type: 'DER',
    schema_version: '0.1.0',
    timestamp: '2026-01-01T00:00:00Z',
    request_context: {
      request_id: 'req-1',
      request_type: 'ACCOUNT_CLOSURE',
      requested_at: '2026-01-01T00:00:00Z',
    },
    data_scope: {
      data_category: 'x',
      scope_description: 'x',
      systems_in_scope: ['s1'],
    },
    execution: {
      execution_status: 'COMPLETE',
      systems_completed: ['s1'],
      systems_pending: [],
    },
    residual_state: {
      residual_copies_declared: false,
      legal_hold: false,
    },
    evidence_metadata: {
      source_system_id: 's1',
      recorded_at: '2026-01-01T00:00:00Z',
      canonicalization_method: 'der-ver-canonical-json-v0.1',
      record_hash: 'a'.repeat(64),
    },
    ...overrides,
  };
}

test('request_type rejects a value outside the closed vocabulary', () => {
  const rec = baseDER();
  rec.request_context.request_type = 'SOMETHING_ELSE';
  assert.equal(validateDER(rec).valid, false);
});

test('request_type accepts every documented value', () => {
  const values = [
    'DATA_SUBJECT_REQUEST', 'CUSTOMER_OFFBOARDING', 'EMPLOYEE_OFFBOARDING', 'VENDOR_EXIT',
    'RETENTION_EXPIRY', 'ACCOUNT_CLOSURE', 'CONTRACT_TERMINATION', 'SYSTEM_MIGRATION',
    'ADMINISTRATIVE_DELETION', 'OTHER',
  ];
  for (const v of values) {
    const rec = baseDER();
    rec.request_context.request_type = v;
    const result = validateDER(rec);
    assert.equal(result.valid, true, `${v} unexpectedly rejected: ${JSON.stringify(result.errors)}`);
  }
});

test('execution_status rejects a value outside the closed vocabulary', () => {
  const rec = baseDER();
  rec.execution.execution_status = 'MOSTLY_DONE';
  assert.equal(validateDER(rec).valid, false);
});

test('execution_status accepts every documented value', () => {
  const values = ['COMPLETE', 'PARTIAL', 'PENDING', 'PENDING_SUBPROCESSOR', 'EXCEPTION', 'LEGAL_HOLD', 'UNVERIFIED', 'FAILED'];
  for (const v of values) {
    const rec = baseDER();
    rec.execution.execution_status = v;
    const result = validateDER(rec);
    assert.equal(result.valid, true, `${v} unexpectedly rejected: ${JSON.stringify(result.errors)}`);
  }
});

function baseVER(overrides = {}) {
  return {
    record_id: 'ver-vocab-test',
    record_type: 'VER',
    schema_version: '0.1.0',
    timestamp: '2026-01-01T00:00:00Z',
    linked_record_id: 'der-vocab-test',
    linked_record_hash: 'a'.repeat(64),
    verification_type: 'periodic_review',
    verification_status: 'CONFIRMED',
    evidence_metadata: {
      recorded_at: '2026-01-01T00:00:00Z',
      canonicalization_method: 'der-ver-canonical-json-v0.1',
      record_hash: 'b'.repeat(64),
    },
    ...overrides,
  };
}

test('verification_status rejects a value outside the closed vocabulary', () => {
  const rec = baseVER();
  rec.verification_status = 'DONE';
  assert.equal(validateVER(rec).valid, false);
});

test('verification_status accepts every documented value', () => {
  const values = ['CONFIRMED', 'PARTIALLY_CONFIRMED', 'EXCEPTION_IDENTIFIED', 'RESIDUAL_COPY_IDENTIFIED', 'SUBPROCESSOR_PENDING', 'UNVERIFIED', 'CORRECTED'];
  for (const v of values) {
    const rec = baseVER();
    rec.verification_status = v;
    const result = validateVER(rec);
    assert.equal(result.valid, true, `${v} unexpectedly rejected: ${JSON.stringify(result.errors)}`);
  }
});

test('record_type is a fixed constant, not an open enum', () => {
  const der = baseDER();
  der.record_type = 'VER';
  assert.equal(validateDER(der).valid, false);

  const ver = baseVER();
  ver.record_type = 'DER';
  assert.equal(validateVER(ver).valid, false);
});
