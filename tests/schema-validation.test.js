'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { validateDER, validateVER } = require('../packages/js/src/validate');

const DATASET_DIR = path.join(__dirname, '..', 'dataset');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'manifest.json'), 'utf8'));

test('manifest: reports at least 300 scenarios across the required scenario families', () => {
  assert.ok(MANIFEST.total_der >= 300, `expected >= 300 DER scenarios, got ${MANIFEST.total_der}`);
  assert.ok(MANIFEST.families.length >= 20, `expected >= 20 scenario families, got ${MANIFEST.families.length}`);
});

test('manifest: every family listed has at least one scenario', () => {
  for (const f of MANIFEST.families) {
    assert.ok(f.scenario_count > 0, `family ${f.key} has zero scenarios`);
  }
});

test('dataset: every DER scenario file validates against der.schema.json', () => {
  let checked = 0;
  for (const scenario of MANIFEST.scenarios) {
    const der = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, scenario.der_file), 'utf8'));
    const result = validateDER(der);
    assert.equal(result.valid, true, `${scenario.der_file} invalid: ${JSON.stringify(result.errors)}`);
    checked += 1;
  }
  assert.equal(checked, MANIFEST.total_der);
});

test('dataset: every linked VER scenario file validates against ver.schema.json', () => {
  let checked = 0;
  for (const scenario of MANIFEST.scenarios) {
    if (!scenario.has_ver) continue;
    const ver = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, scenario.ver_file), 'utf8'));
    const result = validateVER(ver);
    assert.equal(result.valid, true, `${scenario.ver_file} invalid: ${JSON.stringify(result.errors)}`);
    checked += 1;
  }
  assert.equal(checked, MANIFEST.total_ver);
  assert.ok(checked > 0, 'expected at least one linked VER in the dataset');
});

test('dataset: residual-state scenarios (residual copies declared) are present and valid', () => {
  const withResidual = MANIFEST.scenarios.filter((s) => {
    const der = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, s.der_file), 'utf8'));
    return der.residual_state.residual_copies_declared === true;
  });
  assert.ok(withResidual.length > 0, 'expected at least one scenario with residual_copies_declared=true');
});

test('dataset: legal_hold scenarios are present and valid', () => {
  const withHold = MANIFEST.scenarios.filter((s) => {
    const der = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, s.der_file), 'utf8'));
    return der.residual_state.legal_hold === true;
  });
  assert.ok(withHold.length > 0, 'expected at least one legal_hold scenario');
});

test('positive example: validates cleanly', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', 'positive', 'der.json'), 'utf8'));
  const result = validateDER(der);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test('flagship example: DER and VER both validate cleanly', () => {
  const der = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'examples', 'flagship', 'der.json'), 'utf8'));
  assert.equal(validateDER(der).valid, true);
  const verPath = path.join(__dirname, '..', 'examples', 'flagship', 'ver.json');
  if (fs.existsSync(verPath)) {
    const ver = JSON.parse(fs.readFileSync(verPath, 'utf8'));
    assert.equal(validateVER(ver).valid, true);
  }
});
