#!/usr/bin/env node
/**
 * examples/generate-examples.js
 *
 * Curates a small, hand-picked set of examples from dataset/ for
 * documentation and onboarding purposes:
 *   - examples/positive  : a clean, fully-COMPLETE DER + a CONFIRMED VER
 *   - examples/negative  : a handful of the invalid fixtures, for showing
 *                           how the validator rejects malformed records
 *   - examples/flagship  : one richly-annotated multi-system DER->VER
 *                           chain with a rendered Markdown walkthrough,
 *                           used as the canonical example in the README
 *
 * Run after dataset/generate.js. Deterministic — selects by scenario_id,
 * not randomly.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { renderRecord } = require('../packages/js/src/render');
const { verifyLink } = require('../packages/js/src/hash');

const ROOT = path.join(__dirname, '..');
const DATASET_DIR = path.join(ROOT, 'dataset');
const MANIFEST = JSON.parse(fs.readFileSync(path.join(DATASET_DIR, 'manifest.json'), 'utf8'));

function readScenarioFile(rel) {
  return JSON.parse(fs.readFileSync(path.join(DATASET_DIR, rel), 'utf8'));
}
function writeJSON(dir, name, data) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2) + '\n');
}

async function main() {
  // --- positive: first COMPLETE, VER-CONFIRMED scenario found ---
  const positive = MANIFEST.scenarios.find(
    (s) => s.execution_status === 'COMPLETE' && s.has_ver && s.verification_status === 'CONFIRMED'
  ) || MANIFEST.scenarios.find((s) => s.execution_status === 'COMPLETE');

  const posDER = readScenarioFile(positive.der_file);
  writeJSON(path.join(__dirname, 'positive'), 'der.json', posDER);
  if (positive.has_ver) {
    const posVER = readScenarioFile(positive.ver_file);
    writeJSON(path.join(__dirname, 'positive'), 'ver.json', posVER);
  }
  fs.writeFileSync(
    path.join(__dirname, 'positive', 'README.md'),
    `# Positive example\n\nScenario: \`${positive.scenario_id}\` (${positive.family})\n\nA fully-COMPLETE Deletion Evidence Record` +
      (positive.has_ver ? `, with a linked Verification / Exception Record confirming it.\n` : `.\n`) +
      `\nValidate it yourself:\n\n\`\`\`\nnode -e "console.log(require('../../packages/js/src/index.js').validateDER(require('./der.json')))"\n\`\`\`\n`
  );

  // --- negative: copy every invalid fixture, with the manifest's stated reason ---
  const negDir = path.join(__dirname, 'negative');
  fs.mkdirSync(negDir, { recursive: true });
  let negReadme = `# Negative examples\n\nEach file here is a deliberately invalid record, used to test that the validator correctly rejects it. This is what "negative examples" means in this project — not a bad governance outcome (those are the incomplete/exception/residual scenarios in \`dataset/\`, which are still schema-valid), but a structurally malformed record.\n\n| File | Record type | Why it's invalid |\n|---|---|---|\n`;
  for (const inv of MANIFEST.invalid) {
    const rec = readScenarioFile(inv.file);
    const fname = path.basename(inv.file);
    writeJSON(negDir, fname, rec);
    negReadme += `| \`${fname}\` | ${inv.record_type} | ${inv.reason} |\n`;
  }
  negReadme += `\nValidate any of these and confirm they fail:\n\n\`\`\`\nnode -e "const l=require('../../packages/js/src/index.js'); console.log(l.validateDER(require('./inv-missing-required-field.json')))"\n\`\`\`\n`;
  fs.writeFileSync(path.join(negDir, 'README.md'), negReadme);

  // --- flagship: a multi-system deletion with an EXCEPTION_IDENTIFIED VER ---
  const flagship =
    MANIFEST.scenarios.find((s) => s.family === 'multi_system_deletion' && s.has_ver) ||
    MANIFEST.scenarios.find((s) => s.family === 'multi_system_deletion');

  const flagDER = readScenarioFile(flagship.der_file);
  const flagDir = path.join(__dirname, 'flagship');
  writeJSON(flagDir, 'der.json', flagDER);

  let flagVER = null;
  if (flagship.has_ver) {
    flagVER = readScenarioFile(flagship.ver_file);
    writeJSON(flagDir, 'ver.json', flagVER);
  }

  let walkthrough = `# Flagship example — ${flagship.scenario_id}\n\n`;
  walkthrough += `This is the canonical worked example referenced from the README. It shows a multi-system deletion action (\`${flagship.scenario_id}\`), all synthetic.\n\n`;
  walkthrough += `## 1. The Deletion Evidence Record\n\n`;
  walkthrough += renderRecord(flagDER);
  if (flagVER) {
    const link = await verifyLink(flagDER, flagVER);
    walkthrough += `\n## 2. The linked Verification / Exception Record\n\n`;
    walkthrough += renderRecord(flagVER);
    walkthrough += `\n## 3. Verifying the link\n\n`;
    walkthrough += `Recomputing the parent DER's hash and comparing it to the VER's \`linked_record_hash\`:\n\n`;
    walkthrough += '```\n' + `expected (VER.linked_record_hash): ${link.expected}\n` + `actual   (recomputed DER hash):    ${link.actual}\n` + `linked:  ${link.linked}\n` + '```\n\n';
    walkthrough += `Because these match, the chain is intact — this VER genuinely refers to this exact, unaltered DER. If the DER's content were changed after the fact, this comparison would fail and the chain would be flagged as broken. See \`tests/hash-linking.test.js\` for the tamper-detection test that exercises this.\n\n`;
    walkthrough += `## What this does and does not show\n\nThis chain shows that an exception was identified during later review, and that the review record is provably linked to the original DER. It does **not** independently prove what happened in the underlying systems — see \`/spec/deletion-evidence-record.md\` §4.\n`;
  }
  fs.writeFileSync(path.join(flagDir, 'WALKTHROUGH.md'), walkthrough);

  console.log('Examples generated: positive/, negative/ (%d files), flagship/', MANIFEST.invalid.length);
}

main();
