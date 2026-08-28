'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { renderRecord } = require('../packages/js/src/render');

test('renderRecord: DER produces a Markdown document with the boundary statement', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'der-vector-0001.json'), 'utf8'));
  const md = renderRecord(der);
  assert.match(md, /^# Deletion Evidence Record/);
  assert.match(md, /not independent proof/i);
  assert.match(md, new RegExp(der.record_id));
  assert.match(md, new RegExp(der.evidence_metadata.record_hash));
});

test('renderRecord: VER produces a Markdown document referencing its linked parent', () => {
  const ver = JSON.parse(fs.readFileSync(path.join(__dirname, 'vectors', 'ver-vector-0001.json'), 'utf8'));
  const md = renderRecord(ver);
  assert.match(md, /^# Verification \/ Exception Record/);
  assert.match(md, new RegExp(ver.linked_record_id));
  assert.match(md, new RegExp(ver.linked_record_hash));
});

test('renderRecord: throws on an unknown record_type', () => {
  assert.throws(() => renderRecord({ record_type: 'NOT_A_TYPE' }));
});

test('renderRecord: throws on non-object input', () => {
  assert.throws(() => renderRecord(null));
  assert.throws(() => renderRecord('string'));
});
