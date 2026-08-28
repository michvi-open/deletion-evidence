'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { computeRecordHash, sealRecord } = require('../packages/js/src/hash');

const HEX64 = /^[a-f0-9]{64}$/;

test('computeRecordHash: reproduces the committed fixed test vector', async () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const expectedHash = der.evidence_metadata.record_hash;
  const recomputed = await computeRecordHash(der);
  assert.equal(recomputed, expectedHash);
});

test('computeRecordHash: reproduces the committed VER fixed test vector', async () => {
  const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'ver-vector-0001.json'), 'utf8'));
  const expectedHash = ver.evidence_metadata.record_hash;
  const recomputed = await computeRecordHash(ver);
  assert.equal(recomputed, expectedHash);
});

test('computeRecordHash: output is always a 64-char lowercase hex string', async () => {
  const rec = { evidence_metadata: { source_system_id: 'x', record_hash: 'irrelevant' } };
  const hash = await computeRecordHash(rec);
  assert.match(hash, HEX64);
});

test('computeRecordHash: is deterministic — same input, same output, repeatedly', async () => {
  const rec = { a: 1, evidence_metadata: { b: 2, record_hash: 'x' } };
  const h1 = await computeRecordHash(rec);
  const h2 = await computeRecordHash(rec);
  const h3 = await computeRecordHash(rec);
  assert.equal(h1, h2);
  assert.equal(h2, h3);
});

test('computeRecordHash: different content produces a different hash', async () => {
  const a = { data_scope: { data_category: 'x' }, evidence_metadata: { record_hash: 'x' } };
  const b = { data_scope: { data_category: 'y' }, evidence_metadata: { record_hash: 'x' } };
  assert.notEqual(await computeRecordHash(a), await computeRecordHash(b));
});

test('sealRecord: sets evidence_metadata.record_hash without mutating the input', async () => {
  const rec = { evidence_metadata: { source_system_id: 's' } };
  const sealed = await sealRecord(rec);
  assert.match(sealed.evidence_metadata.record_hash, HEX64);
  assert.equal(rec.evidence_metadata.record_hash, undefined);
});
