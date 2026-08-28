/**
 * validate.js
 *
 * validateDER() / validateVER() against the normative schema files in
 * /schema/v0.1/, using the zero-dependency mini-schema engine. In
 * Node.js the schema JSON files are loaded via require(); in a browser
 * context, pass pre-fetched schema objects via `setSchemas()` before
 * calling validateDER/validateVER (see reference-app/app.js for the
 * fetch-based browser wiring).
 */

'use strict';

const { validate } = require('./mini-schema');

let DER_SCHEMA = null;
let VER_SCHEMA = null;
let VOCAB_SCHEMA = null;

function isNode() {
  return typeof process !== 'undefined' && process.versions && process.versions.node;
}

if (isNode()) {
  // eslint-disable-next-line global-require
  DER_SCHEMA = require('../../../schema/v0.1/der.schema.json');
  // eslint-disable-next-line global-require
  VER_SCHEMA = require('../../../schema/v0.1/ver.schema.json');
  // eslint-disable-next-line global-require
  VOCAB_SCHEMA = require('../../../schema/v0.1/vocab.schema.json');
}

/**
 * Supplies schema objects explicitly — required in browser contexts
 * where require()/fs are unavailable. Call once before validateDER/VER.
 * @param {{ der: object, ver: object, vocab: object }} schemas
 */
function setSchemas(schemas) {
  DER_SCHEMA = schemas.der;
  VER_SCHEMA = schemas.ver;
  VOCAB_SCHEMA = schemas.vocab;
}

function assertSchemasLoaded() {
  if (!DER_SCHEMA || !VER_SCHEMA || !VOCAB_SCHEMA) {
    throw new Error(
      'validate.js: schemas not loaded. In a browser, call setSchemas({der, ver, vocab}) first.'
    );
  }
}

/**
 * @param {object} record - candidate Deletion Evidence Record
 * @returns {{ valid: boolean, errors: {path: string, message: string}[] }}
 */
function validateDER(record) {
  assertSchemasLoaded();
  return validate(DER_SCHEMA, record, [DER_SCHEMA, VER_SCHEMA, VOCAB_SCHEMA]);
}

/**
 * @param {object} record - candidate Verification / Exception Record
 * @returns {{ valid: boolean, errors: {path: string, message: string}[] }}
 */
function validateVER(record) {
  assertSchemasLoaded();
  return validate(VER_SCHEMA, record, [DER_SCHEMA, VER_SCHEMA, VOCAB_SCHEMA]);
}

module.exports = { validateDER, validateVER, setSchemas };
