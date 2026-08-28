(function () {
  'use strict';

  DER_LIB.setSchemas(DER_SCHEMAS);

  const REQUEST_TYPES = DER_SCHEMAS.vocab.$defs.request_type.enum;
  const EXECUTION_STATUSES = DER_SCHEMAS.vocab.$defs.execution_status.enum;
  const VERIFICATION_STATUSES = DER_SCHEMAS.vocab.$defs.verification_status.enum;

  let lastDER = null;
  let lastVER = null;

  // ---------------------------------------------------------------- tabs
  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tab]');
    if (!btn) return;
    document.querySelectorAll('nav.tabs button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => (p.style.display = 'none'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
  });
  function goToTab(name) {
    document.querySelector(`nav.tabs button[data-tab="${name}"]`).click();
  }

  function fillSelect(id, values, placeholder) {
    const el = document.getElementById(id);
    const first = placeholder ? `<option value="">${placeholder}</option>` : '';
    el.innerHTML = first + values.map((v) => `<option value="${v}">${v}</option>`).join('');
  }
  fillSelect('der_request_type', REQUEST_TYPES, '— select —');
  fillSelect('der_execution_status', EXECUTION_STATUSES, '— select —');
  fillSelect('ver_status', VERIFICATION_STATUSES, '— select —');

  function splitList(str) {
    return (str || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  function nowLocalInputValue() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  function localInputToISO(value) {
    if (!value) return null;
    return new Date(value).toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  function nowISO() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  }
  function uid(prefix) {
    return prefix + '-' + Math.random().toString(16).slice(2, 10);
  }

  function downloadBlob(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function validityBadge(result) {
    return result.valid
      ? '<span class="badge ok">VALID</span>'
      : '<span class="badge bad">INVALID (' + result.errors.length + ' error' + (result.errors.length === 1 ? '' : 's') + ')</span>';
  }
  function errorList(result) {
    if (result.valid) return '';
    return '<ul class="error-list">' + result.errors.map((e) => `<li><code>${e.path}</code> — ${e.message}</li>`).join('') + '</ul>';
  }

  // ---------------------------------------------------------- Create DER
  document.getElementById('btn-load-example-der').addEventListener('click', () => {
    document.getElementById('der_request_id').value = uid('req');
    document.getElementById('der_request_type').value = 'CUSTOMER_OFFBOARDING';
    document.getElementById('der_requested_at').value = nowLocalInputValue();
    document.getElementById('der_requesting_role').value = 'customer_admin';
    document.getElementById('der_data_category').value = 'customer_account_data';
    document.getElementById('der_subject_ref').value = uid('subject-ref');
    document.getElementById('der_scope_description').value = 'Full account deletion following customer offboarding.';
    document.getElementById('der_systems_in_scope').value = 'saas-app-core-01, crm-system-01';
    document.getElementById('der_processors_in_scope').value = '';
    document.getElementById('der_execution_status').value = 'COMPLETE';
    document.getElementById('der_executed_at').value = nowLocalInputValue();
    document.getElementById('der_execution_method').value = 'Deletion executed via standard offboarding workflow.';
    document.getElementById('der_systems_completed').value = 'saas-app-core-01, crm-system-01';
    document.getElementById('der_systems_pending').value = '';
    document.getElementById('der_backup_state').value = 'included in standard 30-day backup rotation';
    document.getElementById('der_residual_copies').checked = false;
    document.getElementById('der_legal_hold').checked = false;
    document.getElementById('der_source_system_id').value = 'saas-app-core-01';
    document.getElementById('der_responsible_party').value = uid('party-ref');
    document.getElementById('der_evidence_references').value = 'ticket-000001';
  });

  document.getElementById('btn-generate-der').addEventListener('click', async () => {
    const record = {
      record_id: uid('der'),
      record_type: 'DER',
      schema_version: '0.1.0',
      timestamp: nowISO(),
      request_context: {
        request_id: document.getElementById('der_request_id').value,
        request_type: document.getElementById('der_request_type').value,
        requested_at: localInputToISO(document.getElementById('der_requested_at').value),
        requesting_role: document.getElementById('der_requesting_role').value || undefined,
      },
      data_scope: {
        data_category: document.getElementById('der_data_category').value,
        subject_ref: document.getElementById('der_subject_ref').value || undefined,
        scope_description: document.getElementById('der_scope_description').value,
        systems_in_scope: splitList(document.getElementById('der_systems_in_scope').value),
      },
      execution: {
        execution_status: document.getElementById('der_execution_status').value,
        executed_at: localInputToISO(document.getElementById('der_executed_at').value),
        execution_method_declaration: document.getElementById('der_execution_method').value || undefined,
        systems_completed: splitList(document.getElementById('der_systems_completed').value),
        systems_pending: splitList(document.getElementById('der_systems_pending').value),
      },
      residual_state: {
        backup_state: document.getElementById('der_backup_state').value || undefined,
        residual_copies_declared: document.getElementById('der_residual_copies').checked,
        legal_hold: document.getElementById('der_legal_hold').checked,
      },
      evidence_metadata: {
        source_system_id: document.getElementById('der_source_system_id').value,
        responsible_party_reference: document.getElementById('der_responsible_party').value || undefined,
        recorded_at: nowISO(),
        evidence_references: splitList(document.getElementById('der_evidence_references').value),
        canonicalization_method: 'der-ver-canonical-json-v0.1',
        record_hash: 'PENDING',
      },
    };

    const processors = splitList(document.getElementById('der_processors_in_scope').value);
    if (processors.length) record.data_scope.processors_in_scope = processors;
    const retentionExc = document.getElementById('der_retention_exception').value;
    if (retentionExc) record.residual_state.retention_exception = retentionExc;
    const subStatus = document.getElementById('der_subprocessor_status').value;
    if (subStatus) record.residual_state.subprocessor_status = subStatus;

    const sealed = await DER_LIB.sealRecord(record);
    const validation = DER_LIB.validateDER(sealed);
    lastDER = sealed;

    const md = DER_LIB.renderRecord(sealed);
    document.getElementById('der-result').innerHTML = `
      <h3>Result ${validityBadge(validation)}</h3>
      ${errorList(validation)}
      <pre class="output">${escapeHtml(JSON.stringify(sealed, null, 2))}</pre>
      <button class="action" id="btn-download-der-json">Download JSON</button>
      <button class="action secondary" id="btn-download-der-md">Download Markdown</button>
      <button class="action secondary" id="btn-use-for-ver">Use as base for VER</button>
    `;
    document.getElementById('btn-download-der-json').addEventListener('click', () =>
      downloadBlob(sealed.record_id + '.json', JSON.stringify(sealed, null, 2), 'application/json')
    );
    document.getElementById('btn-download-der-md').addEventListener('click', () =>
      downloadBlob(sealed.record_id + '.md', md, 'text/markdown')
    );
    document.getElementById('btn-use-for-ver').addEventListener('click', () => {
      document.getElementById('ver_linked_id').value = sealed.record_id;
      document.getElementById('ver_linked_hash').value = sealed.evidence_metadata.record_hash;
      goToTab('create-ver');
    });
  });

  // ---------------------------------------------------------- Create VER
  document.getElementById('btn-use-last-der').addEventListener('click', () => {
    if (!lastDER) {
      alert('Generate a DER first (Create DER tab).');
      return;
    }
    document.getElementById('ver_linked_id').value = lastDER.record_id;
    document.getElementById('ver_linked_hash').value = lastDER.evidence_metadata.record_hash;
  });

  document.getElementById('btn-generate-ver').addEventListener('click', async () => {
    const record = {
      record_id: uid('ver'),
      record_type: 'VER',
      schema_version: '0.1.0',
      timestamp: nowISO(),
      linked_record_id: document.getElementById('ver_linked_id').value,
      linked_record_hash: document.getElementById('ver_linked_hash').value,
      verification_type: document.getElementById('ver_type').value || undefined,
      verification_status: document.getElementById('ver_status').value,
      evidence_metadata: {
        recorded_by_reference: document.getElementById('ver_recorded_by').value || undefined,
        recorded_at: nowISO(),
        canonicalization_method: 'der-ver-canonical-json-v0.1',
        record_hash: 'PENDING',
      },
    };
    const residualUpdate = document.getElementById('ver_residual_update').value;
    if (residualUpdate) record.residual_state_update = residualUpdate;
    const subUpdate = document.getElementById('ver_subprocessor_update').value;
    if (subUpdate) record.subprocessor_update = subUpdate;
    const exceptionReason = document.getElementById('ver_exception_reason').value;
    if (exceptionReason) record.exception_reason = exceptionReason;
    const reviewNote = document.getElementById('ver_review_note').value;
    if (reviewNote) record.review_note = reviewNote;

    const sealed = await DER_LIB.sealRecord(record);
    const validation = DER_LIB.validateVER(sealed);
    lastVER = sealed;

    let linkInfo = '';
    if (lastDER && lastDER.record_id === sealed.linked_record_id) {
      const link = await DER_LIB.verifyLink(lastDER, sealed);
      linkInfo = `<p>Link check against last generated DER: ${link.linked ? '<span class="badge ok">LINKED</span>' : '<span class="badge bad">NOT LINKED</span>'}</p>`;
    }

    const md = DER_LIB.renderRecord(sealed);
    document.getElementById('ver-result').innerHTML = `
      <h3>Result ${validityBadge(validation)}</h3>
      ${errorList(validation)}
      ${linkInfo}
      <pre class="output">${escapeHtml(JSON.stringify(sealed, null, 2))}</pre>
      <button class="action" id="btn-download-ver-json">Download JSON</button>
      <button class="action secondary" id="btn-download-ver-md">Download Markdown</button>
    `;
    document.getElementById('btn-download-ver-json').addEventListener('click', () =>
      downloadBlob(sealed.record_id + '.json', JSON.stringify(sealed, null, 2), 'application/json')
    );
    document.getElementById('btn-download-ver-md').addEventListener('click', () =>
      downloadBlob(sealed.record_id + '.md', md, 'text/markdown')
    );
  });

  // ---------------------------------------------------------- Validate
  document.getElementById('btn-validate').addEventListener('click', () => {
    const raw = document.getElementById('validate_input').value;
    const out = document.getElementById('validate-result');
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      out.innerHTML = `<p class="badge bad">NOT VALID JSON</p><p>${escapeHtml(e.message)}</p>`;
      return;
    }
    if (parsed.record_type !== 'DER' && parsed.record_type !== 'VER') {
      out.innerHTML = `<p class="badge bad">UNKNOWN record_type</p><p>Expected "DER" or "VER", got ${escapeHtml(String(parsed.record_type))}.</p>`;
      return;
    }
    const validation = parsed.record_type === 'DER' ? DER_LIB.validateDER(parsed) : DER_LIB.validateVER(parsed);
    out.innerHTML = `<h3>${parsed.record_type} ${validityBadge(validation)}</h3>${errorList(validation)}`;
  });

  // ---------------------------------------------------------- Chain
  document.getElementById('btn-verify-chain').addEventListener('click', async () => {
    const out = document.getElementById('chain-result');
    let der, ver;
    try {
      der = JSON.parse(document.getElementById('chain_der').value);
      ver = JSON.parse(document.getElementById('chain_ver').value);
    } catch (e) {
      out.innerHTML = `<p class="badge bad">NOT VALID JSON</p><p>${escapeHtml(e.message)}</p>`;
      return;
    }
    const derValidation = DER_LIB.validateDER(der);
    const verValidation = DER_LIB.validateVER(ver);
    const link = await DER_LIB.verifyLink(der, ver);

    out.innerHTML = `
      <table class="kv">
        <tr><td>DER schema validity</td><td>${validityBadge(derValidation)}</td></tr>
        <tr><td>VER schema validity</td><td>${validityBadge(verValidation)}</td></tr>
        <tr><td>Link (VER.linked_record_hash === recomputed DER hash)</td><td>${link.linked ? '<span class="badge ok">LINKED</span>' : '<span class="badge bad">BROKEN — parent DER may have been altered, or VER does not genuinely link to it</span>'}</td></tr>
        <tr><td>Expected (VER.linked_record_hash)</td><td><code>${escapeHtml(link.expected || '')}</code></td></tr>
        <tr><td>Actual (recomputed DER hash)</td><td><code>${escapeHtml(link.actual)}</code></td></tr>
      </table>
      ${errorList(derValidation)}
      ${errorList(verValidation)}
    `;
  });

  // ---------------------------------------------------------- Demo
  fillSelect('demo_select', DER_DEMOS.map((d, i) => i));
  document.getElementById('demo_select').innerHTML = DER_DEMOS
    .map((d, i) => `<option value="${i}">${d.label} (${d.family}${d.ver ? ', has VER' : ''})</option>`)
    .join('');

  document.getElementById('btn-load-demo').addEventListener('click', () => {
    const demo = DER_DEMOS[Number(document.getElementById('demo_select').value)];
    lastDER = demo.der;
    lastVER = demo.ver || null;
    const derValidation = DER_LIB.validateDER(demo.der);
    let html = `<h3>${demo.label} <span style="font-weight:400;color:#595959">(${demo.family})</span></h3>`;
    html += `<h4>Deletion Evidence Record ${validityBadge(derValidation)}</h4>`;
    html += `<pre class="output">${escapeHtml(JSON.stringify(demo.der, null, 2))}</pre>`;
    if (demo.ver) {
      const verValidation = DER_LIB.validateVER(demo.ver);
      html += `<h4>Linked Verification / Exception Record ${validityBadge(verValidation)}</h4>`;
      html += `<pre class="output">${escapeHtml(JSON.stringify(demo.ver, null, 2))}</pre>`;
    }
    document.getElementById('demo-result').innerHTML = html;
  });

  document.getElementById('btn-demo-to-chain').addEventListener('click', () => {
    if (!lastDER) {
      alert('Load a demo scenario first.');
      return;
    }
    document.getElementById('chain_der').value = JSON.stringify(lastDER, null, 2);
    document.getElementById('chain_ver').value = lastVER ? JSON.stringify(lastVER, null, 2) : '';
    goToTab('chain');
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
