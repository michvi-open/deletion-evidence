# Canonicalization & Hashing — Specification v0.1

Canonicalization method identifier: `der-ver-canonical-json-v0.1`

## What hashing does and does not prove

`record_hash` verifies the **integrity of the evidence record** — that its content
has not changed since the hash was computed, and (for a VER) that it refers to an
exact, unaltered parent DER.

`record_hash` does **not** independently prove that physical deletion occurred in
any external system. It proves the record is internally consistent and unaltered,
nothing more.

## Canonicalization algorithm

Given a DER or VER record object:

1. Deep-clone the record.
2. Remove the `record_hash` field from `evidence_metadata` (it cannot be part of its
   own input).
3. Recursively sort all object keys in strict lexicographic (code-point) order.
   Array element order is preserved as-is — arrays are ordered data, not sorted.
4. Serialize to JSON with:
   - no insignificant whitespace (no spaces after `:` or `,`, no line breaks),
   - UTF-8 encoding,
   - strings escaped per standard JSON string escaping,
   - numbers serialized in standard JSON form (no leading `+`, no trailing zeros
     beyond what standard `JSON.stringify` produces).
5. The result is the **canonical string**.

## Hash computation

```
record_hash = lowercase_hex( SHA-256( UTF8-bytes( canonical_string ) ) )
```

`record_hash` is always a 64-character lowercase hexadecimal string
(`^[a-f0-9]{64}$`).

## Record linking (DER → VER)

A VER pins its parent by recording both:

- `linked_record_id` — the parent DER's `record_id`, and
- `linked_record_hash` — the parent DER's `record_hash` **at the moment the VER was
  created**.

To verify a chain:

1. Recompute the parent DER's `record_hash` using the algorithm above.
2. Compare it to the VER's `linked_record_hash`.
3. If they differ, the parent DER has been altered since the VER was created (or the
   VER is not genuinely linked to that DER). Treat the chain as **broken** and flag
   it — do not silently accept it.

## Test vectors

See `/tests/vectors/` for reproducible input/output pairs: a fixed DER object, its
canonical string, and its expected `record_hash`; and a fixed VER linked to it, with
its own canonical string and expected `record_hash`. Any conforming implementation
in any language must reproduce these exact hash values.

## Reference implementation

`/packages/js/src/canonicalize.js` and `/packages/js/src/hash.js` implement this
algorithm in JavaScript, usable in both Node.js (`crypto` module) and browsers
(`SubtleCrypto`, async).
