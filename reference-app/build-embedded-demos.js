#!/usr/bin/env node
/**
 * reference-app/build-embedded-demos.js
 *
 * Embeds a small, varied selection of dataset/ scenarios into
 * reference-app/demos.embedded.js for the "Load Demo Scenario" screen, so
 * the reference app works with no server and no fetch() call.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const DATASET_DIR = path.join(__dirname, '..', 'dataset');
const manifest = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'manifest.json'), 'utf8'));

const WANTED_FAMILIES = [
  'saas_customer_offboarding',
  'legal_hold',
  'residual_backup',
  'delayed_subprocessor_deletion',
  'multi_system_deletion',
  'correction_after_verification',
];

const demos = [];
for (const familyKey of WANTED_FAMILIES) {
  const scenario = manifest.scenarios.find((s) => s.family === familyKey);
  if (!scenario) continue;
  const der = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, scenario.der_file), 'utf8'));
  const entry = { label: scenario.scenario_id, family: familyKey, der };
  if (scenario.has_ver) {
    entry.ver = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, scenario.ver_file), 'utf8'));
  }
  demos.push(entry);
}

const out = `/**
 * reference-app/demos.embedded.js — GENERATED FILE, do not hand-edit.
 * Source: dataset/ (entirely synthetic). Regenerate:
 *   node reference-app/build-embedded-demos.js
 */
(function (global) {
  'use strict';
  var DEMOS = ${JSON.stringify(demos, null, 2)};
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DEMOS;
  } else {
    global.DER_DEMOS = DEMOS;
  }
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(path.join(__dirname, 'demos.embedded.js'), out);
console.log(`Wrote reference-app/demos.embedded.js with ${demos.length} demo scenarios.`);
