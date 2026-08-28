/**
 * canonicalize.js
 *
 * Implements the canonicalization algorithm documented in
 * /spec/hashing.md (method id: der-ver-canonical-json-v0.1).
 *
 * Zero dependencies. Works identically in Node.js and browsers.
 */

'use strict';

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === 'object') {
    const sorted = {};
    for (const key of Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
      sorted[key] = sortKeysDeep(value[key]);
    }
    return sorted;
  }
  return value;
}

/**
 * Produces the canonical JSON string for a DER or VER record, per
 * der-ver-canonical-json-v0.1: record_hash removed, keys sorted
 * recursively, no insignificant whitespace.
 *
 * @param {object} record
 * @returns {string} canonical JSON string
 */
function canonicalize(record) {
  if (record === null || typeof record !== 'object' || Array.isArray(record)) {
    throw new TypeError('canonicalize: record must be a non-null object');
  }
  const clone = deepClone(record);
  if (clone.evidence_metadata && 'record_hash' in clone.evidence_metadata) {
    delete clone.evidence_metadata.record_hash;
  }
  const sorted = sortKeysDeep(clone);
  return JSON.stringify(sorted);
}

module.exports = { canonicalize };
