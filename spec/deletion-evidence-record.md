# Deletion Evidence Record — Specification v0.1

Status: **v0.1.0**.

## Boundary statement

This project is an open-source public contribution and is separate from Michvi LLP's
confidential advisory engagements and internal methodologies.

## 1. The question this project answers

> "You say the data was deleted. What evidence do you have?"

Deletion Evidence Record (DER) defines a small, open, machine-readable format for
recording the evidence trail around a deletion or data-exit action: what was
requested, what scope it covered, what system or processor was responsible, what
execution state resulted, what residual copies or exceptions remained, and what
downstream/subprocessor status existed at the time.

A companion record type, the Verification / Exception Record (VER), links back to a
specific DER and records what happened *afterward* — a later verification, a
discovered residual copy, a legal hold, a subprocessor confirmation, or a correction.

## 2. What this project is

- An open specification (this document) and a JSON Schema (`/schema/v0.1/`).
- A reference JS implementation for canonicalizing, hashing, and validating records
  (`/packages/js/`).
- A synthetic dataset of example records for testing and onboarding (`/dataset/`).
- A static, browser-only reference application for creating and inspecting records
  (`/reference-app/`).

## 3. What this project is NOT

DER/VER is **not**:

- a deletion engine — it does not delete anything;
- a data discovery scanner;
- a DLP (data loss prevention) tool;
- a consent management platform;
- a privacy compliance certification of any kind;
- a GDPR compliance checker;
- a DPDP compliance checker;
- legal advice;
- an audit opinion;
- a guarantee that deletion physically occurred;
- a replacement for a controller's or processor's legal obligations;
- a Michvi LLP advisory assessment tool, or any part of Michvi's confidential
  advisory methodology.

## 4. The central distinction

DER/VER records **recorded evidence of an asserted/executed deletion action**.

It does **not** provide **independent proof that every physical copy of the
underlying data was actually destroyed**.

Cryptographic hashing (see `/spec/hashing.md`) establishes the **integrity of the
evidence record itself** — that its content has not been altered since it was
recorded, and that a Verification/Exception Record is provably linked to the exact
parent record it refers to. It does **not**, and cannot, independently verify that
data was physically deleted in the external systems the record describes. That
remains a matter of the recording party's own controls, attestations, and — where
relevant — independent audit.

## 5. Canonical object model

### 5.1 Deletion Evidence Record (DER)

| Field | Purpose |
|---|---|
| `record_id`, `record_type`, `schema_version`, `timestamp` | Record identity and versioning |
| `request_context` | What was requested, by what kind of role, and when |
| `data_scope` | What category of data, which systems and processors are in scope — using opaque/pseudonymous references, never real personal data |
| `execution` | Declared execution status and which systems have/haven't completed |
| `residual_state` | Declared backup state, residual copies, retention exceptions, legal hold, subprocessor status |
| `evidence_metadata` | Source system, recording details, and the record's own integrity hash |

### 5.2 Verification / Exception Record (VER)

| Field | Purpose |
|---|---|
| `record_id`, `record_type`, `schema_version`, `timestamp` | Record identity and versioning |
| `linked_record_id`, `linked_record_hash` | Pins this VER to the exact parent DER, by ID and by hash |
| `verification_type`, `verification_status` | What kind of follow-up activity occurred and its outcome |
| `residual_state_update`, `subprocessor_update`, `exception_reason`, `review_note` | What changed or was found |
| `evidence_metadata` | Recording details and this record's own integrity hash |

Full field-level types and constraints are normative in `/schema/v0.1/der.schema.json`
and `/schema/v0.1/ver.schema.json`.

## 6. Closed vocabularies

See `/schema/v0.1/vocab.schema.json` for the authoritative enumerations:
`request_type`, `execution_status`, `verification_status`. These are closed
vocabularies for interoperability — they carry no numeric weight, score, or ranking.
This project does not implement or expose any proprietary scoring model.

## 7. Data minimization by design

DER/VER records are designed to describe an *action*, not a *person*. Fields such as
`subject_ref`, `requesting_organization_ref`, and `responsible_party_reference` are
documented as opaque or pseudonymous references. Implementers are responsible for
not embedding real personal data, secrets, or credentials in any field, including
free-text fields and `evidence_references`.

## 8. Regulatory positioning

This project may support evidence and record-keeping workflows relevant to
obligations under data protection and governance frameworks. **It does not
determine compliance with any specific law or standard**, and does not claim to be
GDPR compliant, DPDP compliant, RBI compliant, MeitY approved, or certified or
endorsed by any regulator. Where a specific legal requirement is referenced in
project documentation, it will cite only verified primary sources and will not be
used to imply the project itself satisfies that requirement.

## 9. Relationship to Michvi LLP

Created and maintained as an open-source public contribution. It is separate from
Michvi LLP's confidential advisory engagements and internal methodologies, and is
not presented as a Michvi product or service.
