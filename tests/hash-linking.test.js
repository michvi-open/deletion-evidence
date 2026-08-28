'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { sealRecord, verifyLink } = require('../packages/js/src/hash');

test('verifyLink: returns linked=true when VER correctly pins the parent DER hash', async () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'ver-vector-0001.json'), 'utf8'));
  const result = await verifyLink(der, ver);
  assert.equal(result.linked, true);
  assert.equal(result.expected, result.actual);
});

test('verifyLink: detects a tampered parent DER (content changed after VER was created)', async () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'ver-vector-0001.json'), 'utf8'));

  // Simulate tampering: someone edits the parent DER's scope description
  // after the VER was already created and hashed against the original.
  const tamperedDER = JSON.parse(JSON.stringify(der));
  tamperedDER.data_scope.scope_description = 'This description was altered after the VER was recorded.';

  const result = await verifyLink(tamperedDER, ver);
  assert.equal(result.linked, false);
  assert.notEqual(result.expected, result.actual);
});

test('verifyLink: detects a VER that never matched its claimed parent (wrong hash from the start)', async () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const forgedVer = {
    linked_record_id: der.record_id,
    linked_record_hash: 'f'.repeat(64),
  };
  const result = await verifyLink(der, forgedVer);
  assert.equal(result.linked, false);
});

test('sealRecord + verifyLink round trip: freshly created DER->VER chain verifies as linked', async () => {
  const der = await sealRecord({
    record_id: 'der-rt-001',
    record_type: 'DER',
    schema_version: '0.1.0',
    timestamp: '2026-03-01T00:00:00Z',
    evidence_metadata: { source_system_id: 'sys' },
  });
  const ver = await sealRecord({
    record_id: 'ver-rt-001',
    record_type: 'VER',
    schema_version: '0.1.0',
    timestamp: '2026-03-02T00:00:00Z',
    linked_record_id: der.record_id,
    linked_record_hash: der.evidence_metadata.record_hash,
    evidence_metadata: {},
  });
  const result = await verifyLink(der, ver);
  assert.equal(result.linked, true);
});
