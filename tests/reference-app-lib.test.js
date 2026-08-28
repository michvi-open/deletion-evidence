'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const DER_LIB = require('../reference-app/lib.js');
const SCHEMAS = require('../reference-app/schemas.embedded.js');

test('reference-app/lib.js: canonicalize matches the fixed test vector (no drift from packages/js)', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const expected = fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.canonical.txt'), 'utf8').trim();
  assert.equal(DER_LIB.canonicalize(der), expected);
});

test('reference-app/lib.js: computeRecordHash matches the fixed test vector (no drift from packages/js)', async () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const hash = await DER_LIB.computeRecordHash(der);
  assert.equal(hash, der.evidence_metadata.record_hash);
});

test('reference-app/lib.js: validateDER agrees with packages/js on the positive example', () => {
  DER_LIB.setSchemas(SCHEMAS);
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', 'positive', 'der.json'), 'utf8'));
  const result = DER_LIB.validateDER(der);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test('reference-app/lib.js: validateDER agrees with packages/js on an invalid fixture', () => {
  DER_LIB.setSchemas(SCHEMAS);
  const der = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'dataset', 'invalid', 'inv-missing-required-field.json'), 'utf8')
  );
  const result = DER_LIB.validateDER(der);
  assert.equal(result.valid, false);
});

test('reference-app/lib.js: renderRecord produces the same shape as packages/js', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const md = DER_LIB.renderRecord(der);
  assert.match(md, /^# Deletion Evidence Record/);
  assert.match(md, new RegExp(der.evidence_metadata.record_hash));
});

test('embedded demos: every demo DER validates, every linked demo VER validates', () => {
  DER_LIB.setSchemas(SCHEMAS);
  const demos = require('../reference-app/demos.embedded.js');
  assert.ok(demos.length >= 5, `expected >= 5 embedded demos, got ${demos.length}`);
  for (const d of demos) {
    const derResult = DER_LIB.validateDER(d.der);
    assert.equal(derResult.valid, true, `${d.label} DER invalid: ${JSON.stringify(derResult.errors)}`);
    if (d.ver) {
      const verResult = DER_LIB.validateVER(d.ver);
      assert.equal(verResult.valid, true, `${d.label} VER invalid: ${JSON.stringify(verResult.errors)}`);
    }
  }
});
