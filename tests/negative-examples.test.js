'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validateDER, validateVER } = require('../packages/js/src/validate');
const { verifyLink } = require('../packages/js/src/hash');

const DATASET_DIR = path.join(__dirname, '..', 'dataset');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'manifest.json'), 'utf8'));

// This one fixture is deliberately SCHEMA-VALID — linked_record_hash is a
// well-formed 64-hex-char string, it's just the wrong value. That is the
// whole point of the tamper-detection feature: it cannot be caught by
// schema validation, only by verifyLink() against the real parent DER.
// It is asserted separately, below, rather than in the blanket loop.
const LINK_LEVEL_ONLY = new Set(['inv-ver-tampered-parent-link']);

test('every declared invalid fixture that is invalid AT THE SCHEMA LEVEL is rejected by the validator', () => {
  const schemaLevelFixtures = MANIFEST.invalid.filter((i) => !LINK_LEVEL_ONLY.has(i.id));
  assert.ok(schemaLevelFixtures.length >= 9, `expected >= 9 schema-level invalid fixtures, got ${schemaLevelFixtures.length}`);
  for (const inv of schemaLevelFixtures) {
    const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, inv.file), 'utf8'));
    const result = inv.record_type === 'VER' ? validateVER(rec) : validateDER(rec);
    assert.equal(result.valid, false, `${inv.file} was expected to be INVALID (${inv.reason}) but validated as true`);
    assert.ok(result.errors.length > 0);
  }
});

test('inv-ver-tampered-parent-link: passes schema validation but fails link verification', async () => {
  const inv = MANIFEST.invalid.find((i) => i.id === 'inv-ver-tampered-parent-link');
  const tamperedVer = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, inv.file), 'utf8'));

  // It IS schema-valid — that's the point.
  assert.equal(validateVER(tamperedVer).valid, true);

  // But it does NOT actually link to its claimed parent DER.
  const parentScenario = MANIFEST.scenarios.find((s) => s.der_record_id === tamperedVer.linked_record_id);
  const parentDer = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, parentScenario.der_file), 'utf8'));
  const link = await verifyLink(parentDer, tamperedVer);
  assert.equal(link.linked, false, 'expected the tampered VER to fail link verification against its real claimed parent');
});

test('missing required field is rejected with an error mentioning the missing field', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-missing-required-field');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes('source_system_id')));
});

test('unknown top-level field is rejected (additionalProperties: false)', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-unknown-field');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes('internal_notes')));
});

test('malformed record_hash (not 64-char hex) is rejected', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-malformed-hash');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes('record_hash')));
});

test('malformed timestamp (not RFC 3339) is rejected', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-bad-timestamp');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
});

test('empty systems_in_scope array is rejected (minItems: 1)', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-empty-systems-in-scope');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
});

test('duplicate entries in systems_in_scope are rejected (uniqueItems: true)', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-duplicate-systems');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
});

test('missing request_context object entirely is rejected', () => {
  const fixture = MANIFEST.invalid.find((i) => i.id === 'inv-missing-request-context-object');
  const rec = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, fixture.file), 'utf8'));
  const result = validateDER(rec);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path.includes('request_context')));
});
