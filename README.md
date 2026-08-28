# Deletion Evidence Record

**Status: v0.1.0.**

> "You say the data was deleted. What evidence do you have?"

This project is an open-source public contribution and is separate from
Michvi LLP's confidential advisory engagements and internal methodologies.

---

## The problem

Deletion and data-exit actions happen constantly — a customer offboards, an
employee leaves, a retention period expires, a vendor contract ends, a data
subject exercises a deletion right. Almost none of these actions leave
behind a portable, structured, independently-checkable record of what was
requested, what was actually done, what remained, and what happened later
when someone checked. Each organization that tries to answer "what evidence
do you have?" ends up inventing its own ad hoc format.

## What Deletion Evidence Record is

A small, open specification and reference implementation for two record
types:

- **Deletion Evidence Record (DER)** — captures a deletion/data-exit action:
  what was requested, its scope, execution status, and residual state.
- **Verification / Exception Record (VER)** — links to a specific DER and
  records what happened afterward: a later verification, a residual copy
  found, a legal hold, a subprocessor confirmation, or a correction.

Records are cryptographically hashed (SHA-256, over a deterministic
canonical form) so their integrity can be checked, and a VER pins the exact
parent DER hash it refers to, so tampering with the parent after the fact is
detectable.

## Who it is for

**Executive value** — CIOs, CISOs, DPOs/privacy leadership, Chief Risk
Officers, internal audit, procurement, vendor management, data governance,
and enterprise architecture: can your organization reconstruct what
deletion action was requested, what was completed, what remained, and what
happened later?

**Developer value** — a reusable public format, a validator, a reference
implementation, and a 320-scenario synthetic dataset, instead of inventing
another proprietary evidence structure from scratch. Relevant to engineers
building SaaS platforms, cloud/platform operators, and privacy operations
tooling.

## What this project does

- Defines the DER/VER JSON Schema (v0.1) with closed vocabularies for
  request type, execution status, and verification status.
- Defines and implements deterministic canonicalization + SHA-256 hashing
  for record integrity and parent-child linking.
- Ships a zero-dependency JS reference implementation
  (`validateDER`, `validateVER`, `canonicalize`, `computeRecordHash`,
  `renderRecord`).
- Ships a 320-scenario synthetic dataset across 20 scenario families, plus
  12 deliberately invalid fixtures for validator testing.
- Ships a static, browser-only reference app — create, validate, and inspect
  records with no login, database, backend, or network dependency.

## What this project does NOT do

This project is **not**:

- a deletion engine — it does not delete anything;
- a data discovery scanner, or a DLP tool;
- a consent management platform;
- a privacy compliance certification, a GDPR compliance checker, or a DPDP
  compliance checker;
- legal advice, or an audit opinion;
- **a guarantee that deletion physically occurred** — see below;
- a replacement for a controller's or processor's legal obligations;
- a Michvi LLP advisory assessment tool, or any part of Michvi's
  confidential advisory methodology.

### The central distinction

DER/VER records **recorded evidence of an asserted/executed deletion
action**. Cryptographic hashing verifies the **integrity of the evidence
record itself** — that it hasn't been altered, and that a VER is provably
linked to the exact parent DER it claims. It does **not**, and cannot,
independently prove that data was physically deleted in the external
systems the record describes. See [`/spec/deletion-evidence-record.md`](spec/deletion-evidence-record.md)
§4 for the full statement.

This project may support evidence and record-keeping workflows relevant to
obligations under data protection and governance frameworks. **It does not
determine compliance** with GDPR, India's DPDP Act, RBI requirements, or any
other law or standard, and is not certified or endorsed by any regulator.

## Quick start

```bash
git clone https://github.com/michvi-open/deletion-evidence.git
cd deletion-evidence
node --test $(find tests -name '*.test.js' -type f | sort)  # run the test suite (50 tests)
open reference-app/index.html             # or xdg-open on Linux — no server needed
```

## Example

A minimal DER, before hashing:

```json
{
  "record_id": "der-00001",
  "record_type": "DER",
  "schema_version": "0.1.0",
  "timestamp": "2026-08-01T10:00:00Z",
  "request_context": {
    "request_id": "req-00001",
    "request_type": "ACCOUNT_CLOSURE",
    "requested_at": "2026-07-30T09:00:00Z"
  },
  "data_scope": {
    "data_category": "customer_account_data",
    "scope_description": "Full account deletion following closure request.",
    "systems_in_scope": ["crm-system-01"]
  },
  "execution": {
    "execution_status": "COMPLETE",
    "systems_completed": ["crm-system-01"],
    "systems_pending": []
  },
  "residual_state": {
    "residual_copies_declared": false,
    "legal_hold": false
  },
  "evidence_metadata": {
    "source_system_id": "crm-system-01",
    "recorded_at": "2026-08-01T10:00:00Z",
    "canonicalization_method": "der-ver-canonical-json-v0.1",
    "record_hash": "<computed — see below>"
  }
}
```

### Computing the hash

```js
const { sealRecord, validateDER } = require('@michvi-open/deletion-evidence');

const sealed = await sealRecord(record); // fills evidence_metadata.record_hash
console.log(validateDER(sealed));        // { valid: true, errors: [] }
```

### A linked VER

```json
{
  "record_id": "ver-00001",
  "record_type": "VER",
  "schema_version": "0.1.0",
  "timestamp": "2026-09-01T09:00:00Z",
  "linked_record_id": "der-00001",
  "linked_record_hash": "<the DER's record_hash, pinned>",
  "verification_type": "periodic_review",
  "verification_status": "CONFIRMED",
  "evidence_metadata": {
    "recorded_at": "2026-09-01T09:00:00Z",
    "canonicalization_method": "der-ver-canonical-json-v0.1",
    "record_hash": "<computed>"
  }
}
```

### Hash integrity

See [`/spec/hashing.md`](spec/hashing.md) for the full canonicalization
algorithm and fixed, reproducible test vectors. In short: sort all keys
recursively, strip the record's own `record_hash` field, serialize with no
whitespace, SHA-256 the UTF-8 bytes, lowercase hex. A VER's
`linked_record_hash` must equal the parent DER's freshly-recomputed hash —
if it doesn't, the chain is broken (altered parent, or a link that was
never genuine). See `examples/flagship/WALKTHROUGH.md` for a fully worked
example, and `examples/negative/inv-ver-tampered-parent-link.json` for a
record that is schema-valid but fails link verification on purpose.

## Full worked example

See [`examples/flagship/`](examples/flagship/) for a complete DER→VER chain
with a Markdown walkthrough, and [`examples/positive/`](examples/positive/)
/ [`examples/negative/`](examples/negative/) for a clean valid record and a
set of deliberately invalid ones (with the reason each is invalid).

## Dataset

[`dataset/`](dataset/) contains 320 synthetic Deletion Evidence Records
across 20 scenario families (SaaS offboarding, employee offboarding, CRM,
analytics, cloud storage, marketing platforms, processor/subprocessor
chains, legal hold, backups, retention expiry, migration, vendor exit,
incomplete deletion, residual copies, disputed completion, corrections, and
more), 183 of them with a linked Verification/Exception Record, plus 12
deliberately invalid fixtures for validator testing. See
[`dataset/manifest.json`](dataset/manifest.json) for the full index, and
[`dataset/generate.js`](dataset/generate.js) for the (deterministic,
reproducible) generator. **Every record is entirely synthetic** — no real
customer data, no real personal data, no Michvi confidential material.

## Reference app

[`reference-app/`](reference-app/) — open `index.html` directly, no server
needed. Five screens: Create DER, Create VER, Validate Existing Record, View
Linked Evidence Chain, Load Demo Scenario. Static HTML/CSS/JS only, no
login, no database, no backend, no telemetry, no network dependency.

> Runs entirely in your browser. Records are not transmitted or stored by
> Michvi.

## Developer usage

```bash
cd packages/js
node -e "
const der = require('./src/index.js');
// canonicalize(), computeRecordHash(), sealRecord(), verifyLink(),
// validateDER(), validateVER(), renderRecord()
"
```

Zero runtime dependencies. Works in Node.js ≥20 and in browsers (via
`globalThis.crypto.subtle`). See [`packages/js/package.json`](packages/js/package.json).
This package is prepared for later npm publication but has **not** been
published — see [`RELEASE_NOTES_v0.1.0.md`](RELEASE_NOTES_v0.1.0.md).

## Privacy / data minimization

DER/VER records are designed to describe an *action*, not a *person*.
Reference fields (`subject_ref`, `requesting_organization_ref`,
`responsible_party_reference`, etc.) are documented as opaque or
pseudonymous — implementers are responsible for not embedding real personal
data, secrets, or credentials in any field. See
[`/spec/deletion-evidence-record.md`](spec/deletion-evidence-record.md) §7.

## Licensing

- **Code** (`packages/js`, `reference-app`, `dataset/generate.js`, tests):
  Apache-2.0 — see [`LICENSE`](LICENSE).
- **Specification, schema, and dataset**: CC0 1.0 public-domain dedication
  — see [`LICENSE-CC0`](LICENSE-CC0).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Security

See [`SECURITY.md`](SECURITY.md).

## Governance

See [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Relationship to Michvi LLP

Michvi LLP is an independent governance advisory and research firm — **not**
a software implementation vendor. This project is an open-source public
contribution and is separate from Michvi LLP's confidential advisory
engagements and internal methodologies. It is not presented, marketed, or
sold as a Michvi product or service.

## Attribution and Acknowledgements

Deletion Evidence Record was initiated and is maintained by Shikhar Jha as an independent open-source project.

Special acknowledgement is extended to Ashok Kumar Jha and Vinita Jha for their continued support of the work.

Published with support from [Michvi LLP](https://michvi.com).
