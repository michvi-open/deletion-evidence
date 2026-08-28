/**
 * hash.js
 *
 * SHA-256 hashing over the canonical JSON string, using the Web Crypto
 * API (`globalThis.crypto.subtle`), which is available natively in both
 * modern browsers and Node.js (>=19). Zero dependencies.
 *
 * IMPORTANT — what this proves and does not prove:
 * record_hash verifies the integrity of the evidence record itself. It
 * does NOT independently prove that physical deletion occurred in any
 * external system. See /spec/hashing.md.
 */

'use strict';

const { canonicalize } = require('./canonicalize');

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes the SHA-256 hash (lowercase hex) of a record's canonical form.
 * The record's own evidence_metadata.record_hash field is excluded from
 * the input, per the canonicalization spec.
 *
 * @param {object} record
 * @returns {Promise<string>} 64-char lowercase hex SHA-256 digest
 */
async function computeRecordHash(record) {
  const canonical = canonicalize(record);
  const subtle = (globalThis.crypto && globalThis.crypto.subtle) || null;
  if (!subtle) {
    throw new Error(
      'computeRecordHash: Web Crypto (globalThis.crypto.subtle) is not available in this environment.'
    );
  }
  const data = new TextEncoder().encode(canonical);
  const digest = await subtle.digest('SHA-256', data);
  return bufferToHex(digest);
}

/**
 * Recomputes and applies record_hash onto a (mutable) copy of the record,
 * returning the new object with evidence_metadata.record_hash set.
 * Does not mutate the input.
 *
 * @param {object} record
 * @returns {Promise<object>} record with evidence_metadata.record_hash set
 */
async function sealRecord(record) {
  const hash = await computeRecordHash(record);
  const sealed = JSON.parse(JSON.stringify(record));
  sealed.evidence_metadata = sealed.evidence_metadata || {};
  sealed.evidence_metadata.record_hash = hash;
  return sealed;
}

/**
 * Verifies that a VER's linked_record_hash matches the actual, freshly
 * recomputed hash of the parent DER — i.e. the parent has not been
 * altered since the VER was created.
 *
 * @param {object} parentDER
 * @param {object} childVER
 * @returns {Promise<{ linked: boolean, expected: string, actual: string }>}
 */
async function verifyLink(parentDER, childVER) {
  const actual = await computeRecordHash(parentDER);
  const expected = childVER && childVER.linked_record_hash;
  return { linked: actual === expected, expected, actual };
}

module.exports = { computeRecordHash, sealRecord, verifyLink };
