#!/usr/bin/env node
/**
 * reference-app/build-embedded-schemas.js
 *
 * Embeds /schema/v0.1/*.json into reference-app/schemas.embedded.js so the
 * reference app works when opened directly (file://) with no server and no
 * fetch() call. Single source of truth stays /schema/v0.1/ — re-run this
 * after any schema change.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_DIR = path.join(__dirname, '..', 'schema', 'v0.1');
const der = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, 'der.schema.json'), 'utf8'));
const ver = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, 'ver.schema.json'), 'utf8'));
const vocab = JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, 'vocab.schema.json'), 'utf8'));

const out = `/**
 * reference-app/schemas.embedded.js — GENERATED FILE, do not hand-edit.
 * Source of truth: /schema/v0.1/*.json
 * Regenerate: node reference-app/build-embedded-schemas.js
 */
(function (global) {
  'use strict';
  var SCHEMAS = {
    der: ${JSON.stringify(der)},
    ver: ${JSON.stringify(ver)},
    vocab: ${JSON.stringify(vocab)}
  };
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SCHEMAS;
  } else {
    global.DER_SCHEMAS = SCHEMAS;
  }
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(path.join(__dirname, 'schemas.embedded.js'), out);
console.log('Wrote reference-app/schemas.embedded.js');
