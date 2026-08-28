# Negative examples

Each file here is a deliberately invalid record, used to test that the validator correctly rejects it. This is what "negative examples" means in this project — not a bad governance outcome (those are the incomplete/exception/residual scenarios in `dataset/`, which are still schema-valid), but a structurally malformed record.

| File | Record type | Why it's invalid |
|---|---|---|
| `inv-missing-required-field.json` | DER | evidence_metadata.source_system_id is missing (required field). |
| `inv-unknown-field.json` | DER | Top-level unknown field "internal_notes" present; additionalProperties is false. |
| `inv-bad-enum-execution-status.json` | DER | execution.execution_status is "DONE", not a value in the closed vocabulary. |
| `inv-bad-record-type.json` | DER | record_type is "der" (lowercase) instead of the required constant "DER". |
| `inv-malformed-hash.json` | DER | evidence_metadata.record_hash is not a 64-char lowercase hex string. |
| `inv-bad-timestamp.json` | DER | timestamp is not RFC 3339 (missing time component). |
| `inv-wrong-schema-version.json` | DER | schema_version is "0.2.0", which does not match the required constant "0.1.0". |
| `inv-empty-systems-in-scope.json` | DER | data_scope.systems_in_scope is an empty array; minItems is 1. |
| `inv-duplicate-systems.json` | DER | data_scope.systems_in_scope contains a duplicate entry; uniqueItems is true. |
| `inv-missing-request-context-object.json` | DER | request_context is entirely missing (required top-level object). |
| `inv-ver-tampered-parent-link.json` | VER | VER linked_record_hash does not match its parent DER's actual hash (simulated tamper). |
| `inv-ver-bad-verification-status.json` | VER | VER verification_status is "DONE", not a value in the closed vocabulary. |

Validate any of these and confirm they fail:

```
node -e "const l=require('../../packages/js/src/index.js'); console.log(l.validateDER(require('./inv-missing-required-field.json')))"
```
