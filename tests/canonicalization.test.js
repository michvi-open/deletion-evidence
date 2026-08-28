'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { canonicalize } = require('../packages/js/src/canonicalize');

test('canonicalize: key order does not affect output', () => {
  const a = { b: 1, a: 2, evidence_metadata: { record_hash: 'x', source_system_id: 's' } };
  const b = { evidence_metadata: { source_system_id: 's', record_hash: 'x' }, a: 2, b: 1 };
  assert.equal(canonicalize(a), canonicalize(b));
});

test('canonicalize: record_hash is excluded from the canonical form', () => {
  const withHash = { evidence_metadata: { record_hash: 'abc123', source_system_id: 's' } };
  const withoutHash = { evidence_metadata: { source_system_id: 's' } };
  assert.equal(canonicalize(withHash), canonicalize(withoutHash));
});

test('canonicalize: array order is preserved, not sorted', () => {
  const rec = { data_scope: { systems_in_scope: ['b', 'a'] } };
  assert.match(canonicalize(rec), /\["b","a"\]/);
});

test('canonicalize: nested objects are sorted recursively', () => {
  const rec = { z: { y: 1, x: 2 }, a: 1 };
  assert.equal(canonicalize(rec), '{"a":1,"z":{"x":2,"y":1}}');
});

test('canonicalize: throws on non-object input', () => {
  assert.throws(() => canonicalize(null));
  assert.throws(() => canonicalize('string'));
  assert.throws(() => canonicalize([1, 2]));
});

test('canonicalize: matches the committed fixed test vector', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const expected = fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.canonical.txt'), 'utf8').trim();
  assert.equal(canonicalize(der), expected);
});
