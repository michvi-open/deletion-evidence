/**
 * render.js
 *
 * renderRecord() — produces a human-readable Markdown rendering of a DER
 * or VER record, for the "download human-readable Markdown" feature.
 * Zero dependencies.
 */

'use strict';

function line(label, value) {
  if (value === undefined || value === null || value === '') return '';
  if (Array.isArray(value)) {
    if (value.length === 0) return '';
    return `- **${label}:** ${value.join(', ')}\n`;
  }
  return `- **${label}:** ${value}\n`;
}

function renderDER(r) {
  const rc = r.request_context || {};
  const ds = r.data_scope || {};
  const ex = r.execution || {};
  const rs = r.residual_state || {};
  const em = r.evidence_metadata || {};

  let md = `# Deletion Evidence Record\n\n`;
  md += `\`${r.record_id || '(no record_id)'}\` · schema v${r.schema_version || '?'} · recorded ${r.timestamp || '?'}\n\n`;
  md += `> This record documents an asserted/executed deletion action. It is not independent proof that every physical copy of the underlying data was destroyed.\n\n`;

  md += `## Request\n\n`;
  md += line('Request ID', rc.request_id);
  md += line('Request type', rc.request_type);
  md += line('Requested at', rc.requested_at);
  md += line('Requesting role', rc.requesting_role);
  md += line('Requesting organization ref', rc.requesting_organization_ref);

  md += `\n## Scope\n\n`;
  md += line('Data category', ds.data_category);
  md += line('Subject reference', ds.subject_ref);
  md += line('Description', ds.scope_description);
  md += line('Systems in scope', ds.systems_in_scope);
  md += line('Processors in scope', ds.processors_in_scope);

  md += `\n## Execution\n\n`;
  md += line('Status', ex.execution_status);
  md += line('Executed at', ex.executed_at);
  md += line('Method (declared)', ex.execution_method_declaration);
  md += line('Systems completed', ex.systems_completed);
  md += line('Systems pending', ex.systems_pending);

  md += `\n## Residual state\n\n`;
  md += line('Backup state', rs.backup_state);
  md += line('Residual copies declared', rs.residual_copies_declared);
  md += line('Retention exception', rs.retention_exception);
  md += line('Legal hold', rs.legal_hold);
  md += line('Subprocessor status', rs.subprocessor_status);

  md += `\n## Evidence metadata\n\n`;
  md += line('Source system', em.source_system_id);
  md += line('Responsible party ref', em.responsible_party_reference);
  md += line('Recorded at', em.recorded_at);
  md += line('Evidence references', em.evidence_references);
  md += line('Canonicalization method', em.canonicalization_method);
  md += line('Record hash (SHA-256)', em.record_hash);

  return md;
}

function renderVER(r) {
  const em = r.evidence_metadata || {};

  let md = `# Verification / Exception Record\n\n`;
  md += `\`${r.record_id || '(no record_id)'}\` · schema v${r.schema_version || '?'} · recorded ${r.timestamp || '?'}\n\n`;

  md += `## Linkage\n\n`;
  md += line('Linked DER record ID', r.linked_record_id);
  md += line('Linked DER hash (pinned)', r.linked_record_hash);

  md += `\n## Verification\n\n`;
  md += line('Type', r.verification_type);
  md += line('Status', r.verification_status);
  md += line('Residual state update', r.residual_state_update);
  md += line('Subprocessor update', r.subprocessor_update);
  md += line('Exception reason', r.exception_reason);
  md += line('Review note', r.review_note);

  md += `\n## Evidence metadata\n\n`;
  md += line('Recorded by ref', em.recorded_by_reference);
  md += line('Recorded at', em.recorded_at);
  md += line('Evidence references', em.evidence_references);
  md += line('Canonicalization method', em.canonicalization_method);
  md += line('Record hash (SHA-256)', em.record_hash);

  return md;
}

/**
 * @param {object} record - a DER or VER (discriminated by record_type)
 * @returns {string} Markdown
 */
function renderRecord(record) {
  if (!record || typeof record !== 'object') {
    throw new TypeError('renderRecord: record must be an object');
  }
  if (record.record_type === 'DER') return renderDER(record);
  if (record.record_type === 'VER') return renderVER(record);
  throw new Error(`renderRecord: unknown record_type "${record.record_type}"`);
}

module.exports = { renderRecord };
