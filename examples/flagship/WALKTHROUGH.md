# Flagship example — multi_system_deletion-01

This is the canonical worked example referenced from the README. It shows a multi-system deletion action (`multi_system_deletion-01`), all synthetic.

## 1. The Deletion Evidence Record

# Deletion Evidence Record

`der-00289` · schema v0.1.0 · recorded 2026-08-25T14:52:58Z

> This record documents an asserted/executed deletion action. It is not independent proof that every physical copy of the underlying data was destroyed.

## Request

- **Request ID:** req-00289
- **Request type:** CUSTOMER_OFFBOARDING
- **Requested at:** 2026-07-30T09:03:59Z
- **Requesting role:** account_owner
- **Requesting organization ref:** org-ref-1e749d1

## Scope

- **Data category:** employee_hr_record
- **Subject reference:** subject-ref-52d40ca
- **Description:** Multi-system deletion scenario — synthetic record for dataset testing purposes only.
- **Systems in scope:** marketing-platform-email-02
- **Processors in scope:** subprocessor-support-tooling-01, subprocessor-logistics-01

## Execution

- **Status:** COMPLETE
- **Executed at:** 2026-08-18T23:47:47Z
- **Method (declared):** Deletion/data-exit executed via standard operational workflow declaration (synthetic).
- **Systems completed:** marketing-platform-email-02

## Residual state

- **Backup state:** backup purge pending next rotation cycle
- **Residual copies declared:** false
- **Legal hold:** false
- **Subprocessor status:** subprocessor deletion confirmed

## Evidence metadata

- **Source system:** marketing-platform-email-02
- **Responsible party ref:** party-ref-2fe9c24
- **Recorded at:** 2026-08-25T14:52:58Z
- **Evidence references:** ticket-000289
- **Canonicalization method:** der-ver-canonical-json-v0.1
- **Record hash (SHA-256):** 3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436

## 2. The linked Verification / Exception Record

# Verification / Exception Record

`ver-00289` · schema v0.1.0 · recorded 2026-08-23T00:14:49Z

## Linkage

- **Linked DER record ID:** der-00289
- **Linked DER hash (pinned):** 3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436

## Verification

- **Type:** internal_QA_review
- **Status:** CONFIRMED

## Evidence metadata

- **Recorded by ref:** reviewer-ref-415ee77
- **Recorded at:** 2026-08-25T01:05:49Z
- **Evidence references:** review-000289
- **Canonicalization method:** der-ver-canonical-json-v0.1
- **Record hash (SHA-256):** e468262c8551e59df413f0d342a8510a747c829415e781346ac616918e13ecbe

## 3. Verifying the link

Recomputing the parent DER's hash and comparing it to the VER's `linked_record_hash`:

```
expected (VER.linked_record_hash): 3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436
actual   (recomputed DER hash):    3f7cc76ebf5bcde73fe735955552759b12c9546a35e7029611f24a7cf7c44436
linked:  true
```

Because these match, the chain is intact — this VER genuinely refers to this exact, unaltered DER. If the DER's content were changed after the fact, this comparison would fail and the chain would be flagged as broken. See `tests/hash-linking.test.js` for the tamper-detection test that exercises this.

## What this does and does not show

This chain shows that an exception was identified during later review, and that the review record is provably linked to the original DER. It does **not** independently prove what happened in the underlying systems — see `/spec/deletion-evidence-record.md` §4.
