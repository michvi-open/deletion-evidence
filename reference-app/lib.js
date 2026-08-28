/**
 * reference-app/lib.js
 *
 * Browser-native, zero-dependency, zero-build port of packages/js/src/*.
 * Kept behaviorally identical on purpose — tests/reference-app-lib.test.js
 * checks this file reproduces the exact same fixed test vector hash as
 * packages/js, so the two copies cannot silently drift apart.
 *
 * Loadable two ways:
 *   - <script src="lib.js"></script>  -> exposes window.DER_LIB
 *   - require('./lib.js') in Node     -> module.exports (used by tests)
 */
(function (global) {
  'use strict';

  // ---- canonicalize -------------------------------------------------
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function sortKeysDeep(value) {
    if (Array.isArray(value)) return value.map(sortKeysDeep);
    if (value !== null && typeof value === 'object') {
      const sorted = {};
      for (const key of Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
        sorted[key] = sortKeysDeep(value[key]);
      }
      return sorted;
    }
    return value;
  }
  function canonicalize(record) {
    if (record === null || typeof record !== 'object' || Array.isArray(record)) {
      throw new TypeError('canonicalize: record must be a non-null object');
    }
    const clone = deepClone(record);
    if (clone.evidence_metadata && 'record_hash' in clone.evidence_metadata) {
      delete clone.evidence_metadata.record_hash;
    }
    return JSON.stringify(sortKeysDeep(clone));
  }

  // ---- hash -----------------------------------------------------------
  function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  async function computeRecordHash(record) {
    const canonical = canonicalize(record);
    const subtle = (global.crypto && global.crypto.subtle) || null;
    if (!subtle) throw new Error('computeRecordHash: Web Crypto not available in this environment.');
    const data = new TextEncoder().encode(canonical);
    const digest = await subtle.digest('SHA-256', data);
    return bufferToHex(digest);
  }
  async function sealRecord(record) {
    const hash = await computeRecordHash(record);
    const sealed = JSON.parse(JSON.stringify(record));
    sealed.evidence_metadata = sealed.evidence_metadata || {};
    sealed.evidence_metadata.record_hash = hash;
    return sealed;
  }
  async function verifyLink(parentDER, childVER) {
    const actual = await computeRecordHash(parentDER);
    const expected = childVER && childVER.linked_record_hash;
    return { linked: actual === expected, expected, actual };
  }

  // ---- mini schema validator (subset used by der/ver schemas) --------
  const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
  function typeOf(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  function resolveRef(ref, rootSchemas) {
    const [base, fragment] = ref.split('#');
    const root = rootSchemas.find((s) => s.$id === base);
    if (!root) throw new Error('mini-schema: cannot resolve $ref base "' + base + '"');
    if (!fragment || fragment === '/') return root;
    let node = root;
    for (const part of fragment.split('/').filter(Boolean)) {
      node = node[part];
      if (node === undefined) throw new Error('mini-schema: cannot resolve $ref fragment "' + fragment + '"');
    }
    return node;
  }
  function validateNode(schema, data, path, rootSchemas, errors) {
    if (schema.$ref) {
      validateNode(resolveRef(schema.$ref, rootSchemas), data, path, rootSchemas, errors);
      return;
    }
    if (schema.const !== undefined && data !== schema.const) {
      errors.push({ path, message: 'must equal constant "' + schema.const + '"' });
      return;
    }
    if (schema.enum !== undefined && !schema.enum.includes(data)) {
      errors.push({ path, message: 'must be one of [' + schema.enum.join(', ') + ']' });
      return;
    }
    if (schema.type !== undefined) {
      const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
      const actual = typeOf(data);
      if (!allowed.includes(actual) && !(actual === 'number' && allowed.includes('number'))) {
        errors.push({ path, message: 'must be type ' + allowed.join('|') + ', got ' + actual });
        return;
      }
    }
    if (typeof data === 'string') {
      if (schema.minLength !== undefined && data.length < schema.minLength) errors.push({ path, message: 'string shorter than minLength ' + schema.minLength });
      if (schema.maxLength !== undefined && data.length > schema.maxLength) errors.push({ path, message: 'string longer than maxLength ' + schema.maxLength });
      if (schema.pattern !== undefined && !new RegExp(schema.pattern).test(data)) errors.push({ path, message: 'does not match pattern ' + schema.pattern });
      if (schema.format === 'date-time' && !DATE_TIME_RE.test(data)) errors.push({ path, message: 'not a valid RFC 3339 date-time' });
    }
    if (data !== null && typeOf(data) === 'object' && schema.properties) {
      for (const key of schema.required || []) {
        if (!(key in data)) errors.push({ path: path + '.' + key, message: 'missing required field' });
      }
      if (schema.additionalProperties === false) {
        const allowedKeys = new Set(Object.keys(schema.properties));
        for (const key of Object.keys(data)) {
          if (!allowedKeys.has(key)) errors.push({ path: path + '.' + key, message: 'unknown field not permitted by schema' });
        }
      }
      for (const key of Object.keys(schema.properties)) {
        if (key in data) validateNode(schema.properties[key], data[key], path + '.' + key, rootSchemas, errors);
      }
    }
    if (typeOf(data) === 'array' && schema.items) {
      if (schema.minItems !== undefined && data.length < schema.minItems) errors.push({ path, message: 'array shorter than minItems ' + schema.minItems });
      if (schema.uniqueItems) {
        const seen = new Set(data.map((v) => JSON.stringify(v)));
        if (seen.size !== data.length) errors.push({ path, message: 'array items must be unique' });
      }
      data.forEach((item, i) => validateNode(schema.items, item, path + '[' + i + ']', rootSchemas, errors));
    }
  }
  function schemaValidate(schema, data, rootSchemas) {
    const errors = [];
    validateNode(schema, data, '$', rootSchemas, errors);
    return { valid: errors.length === 0, errors };
  }

  let DER_SCHEMA = null, VER_SCHEMA = null, VOCAB_SCHEMA = null;
  function setSchemas(schemas) {
    DER_SCHEMA = schemas.der;
    VER_SCHEMA = schemas.ver;
    VOCAB_SCHEMA = schemas.vocab;
  }
  function validateDER(record) {
    if (!DER_SCHEMA) throw new Error('lib.js: schemas not loaded — call setSchemas() first.');
    return schemaValidate(DER_SCHEMA, record, [DER_SCHEMA, VER_SCHEMA, VOCAB_SCHEMA]);
  }
  function validateVER(record) {
    if (!VER_SCHEMA) throw new Error('lib.js: schemas not loaded — call setSchemas() first.');
    return schemaValidate(VER_SCHEMA, record, [DER_SCHEMA, VER_SCHEMA, VOCAB_SCHEMA]);
  }

  // ---- render -----------------------------------------------------------
  function line(label, value) {
    if (value === undefined || value === null || value === '') return '';
    if (Array.isArray(value)) return value.length ? '- **' + label + ':** ' + value.join(', ') + '\n' : '';
    return '- **' + label + ':** ' + value + '\n';
  }
  function renderDER(r) {
    const rc = r.request_context || {}, ds = r.data_scope || {}, ex = r.execution || {}, rs = r.residual_state || {}, em = r.evidence_metadata || {};
    let md = '# Deletion Evidence Record\n\n';
    md += '`' + (r.record_id || '(no record_id)') + '` · schema v' + (r.schema_version || '?') + ' · recorded ' + (r.timestamp || '?') + '\n\n';
    md += '> This record documents an asserted/executed deletion action. It is not independent proof that every physical copy of the underlying data was destroyed.\n\n';
    md += '## Request\n\n' + line('Request ID', rc.request_id) + line('Request type', rc.request_type) + line('Requested at', rc.requested_at) + line('Requesting role', rc.requesting_role) + line('Requesting organization ref', rc.requesting_organization_ref);
    md += '\n## Scope\n\n' + line('Data category', ds.data_category) + line('Subject reference', ds.subject_ref) + line('Description', ds.scope_description) + line('Systems in scope', ds.systems_in_scope) + line('Processors in scope', ds.processors_in_scope);
    md += '\n## Execution\n\n' + line('Status', ex.execution_status) + line('Executed at', ex.executed_at) + line('Method (declared)', ex.execution_method_declaration) + line('Systems completed', ex.systems_completed) + line('Systems pending', ex.systems_pending);
    md += '\n## Residual state\n\n' + line('Backup state', rs.backup_state) + line('Residual copies declared', rs.residual_copies_declared) + line('Retention exception', rs.retention_exception) + line('Legal hold', rs.legal_hold) + line('Subprocessor status', rs.subprocessor_status);
    md += '\n## Evidence metadata\n\n' + line('Source system', em.source_system_id) + line('Responsible party ref', em.responsible_party_reference) + line('Recorded at', em.recorded_at) + line('Evidence references', em.evidence_references) + line('Canonicalization method', em.canonicalization_method) + line('Record hash (SHA-256)', em.record_hash);
    return md;
  }
  function renderVER(r) {
    const em = r.evidence_metadata || {};
    let md = '# Verification / Exception Record\n\n';
    md += '`' + (r.record_id || '(no record_id)') + '` · schema v' + (r.schema_version || '?') + ' · recorded ' + (r.timestamp || '?') + '\n\n';
    md += '## Linkage\n\n' + line('Linked DER record ID', r.linked_record_id) + line('Linked DER hash (pinned)', r.linked_record_hash);
    md += '\n## Verification\n\n' + line('Type', r.verification_type) + line('Status', r.verification_status) + line('Residual state update', r.residual_state_update) + line('Subprocessor update', r.subprocessor_update) + line('Exception reason', r.exception_reason) + line('Review note', r.review_note);
    md += '\n## Evidence metadata\n\n' + line('Recorded by ref', em.recorded_by_reference) + line('Recorded at', em.recorded_at) + line('Evidence references', em.evidence_references) + line('Canonicalization method', em.canonicalization_method) + line('Record hash (SHA-256)', em.record_hash);
    return md;
  }
  function renderRecord(record) {
    if (!record || typeof record !== 'object') throw new TypeError('renderRecord: record must be an object');
    if (record.record_type === 'DER') return renderDER(record);
    if (record.record_type === 'VER') return renderVER(record);
    throw new Error('renderRecord: unknown record_type "' + record.record_type + '"');
  }

  const DER_LIB = { canonicalize, computeRecordHash, sealRecord, verifyLink, validateDER, validateVER, setSchemas, renderRecord };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DER_LIB;
  } else {
    global.DER_LIB = DER_LIB;
  }
})(typeof window !== 'undefined' ? window : globalThis);
