# Security Policy

## Scope

Deletion Evidence Record (DER/VER) is a specification and a static,
client-side reference implementation. It has no server component, no
database, no authentication, and no telemetry by default. The realistic
security surface is:

- the canonicalization/hashing implementation (`packages/js`,
  `reference-app/lib.js`) — a bug here could produce incorrect or
  non-reproducible hashes, undermining the integrity guarantee this project
  exists to provide;
- the schema validator (`mini-schema.js`) — a bug could accept a record it
  should reject, or reject one it should accept;
- the reference app (`reference-app/`) — a bug could cause it to transmit or
  persist data it claims not to (this would contradict the "runs entirely in
  your browser" statement and is treated as a security-relevant defect, not
  just a bug).

## What is explicitly out of scope

- Whether an implementer's actual deletion process worked. This project
  records evidence of an asserted/executed deletion action — it does not
  perform deletion, and a vulnerability report that a DER "doesn't prove
  data was really deleted" is a restatement of the project's documented
  scope (see `spec/deletion-evidence-record.md` §4), not a security issue.
- Fields an implementer chooses to populate with sensitive data against this
  project's data-minimization guidance (§7 of the same document). The schema
  cannot enforce what implementers put in free-text fields.

## Reporting a vulnerability

Please do not open a public GitHub issue for a security-relevant report.

Security-relevant reports should be sent privately to
`contact@michvi.com`. Please include enough detail to reproduce or assess
the issue, and do not include unnecessary personal data, credentials, or
production secrets.

## Response

As this is a small open-source project maintained on a best-effort basis, no
formal response-time SLA is committed in v0.1.
