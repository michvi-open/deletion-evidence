# Release Notes — v0.1.0

This is the first version of Deletion Evidence Record: a portable,
machine-readable evidence format for deletion/data-exit actions.

Prepared for the Deletion Evidence Record v0.1.0 public release.

## What's in v0.1.0

- **Specification**: `spec/deletion-evidence-record.md`, `spec/hashing.md`.
- **Schema**: `schema/v0.1/der.schema.json`, `ver.schema.json`,
  `vocab.schema.json` (JSON Schema 2020-12).
- **Reference implementation**: `packages/js` (zero runtime dependencies,
  Node ≥20 and browsers via Web Crypto).
- **Dataset**: 320 synthetic scenarios, 20 families, 183 linked
  DER→VER chains, 12 invalid fixtures. `dataset/manifest.json`.
- **Reference app**: static, browser-only, 5 screens, zero network
  dependency. `reference-app/index.html`.
- **Tests**: 50 tests, all passing. `node --test "tests/**/*.test.js"`.

## Explicitly out of scope for v0.1.0

- No npm publication (package is prepared, marked `private: true`).
- The GitHub repository is prepared privately for public release.
- No public canonical URLs are live yet (`michvi.com/open-source/...`
  namespace is reserved but not deployed).
- No formal legal review of the recommended licensing model.
- No independent security review.

## Upgrade / compatibility notes

This is the first version — no prior schema version exists.
`schema_version` is a fixed constant `"0.1.0"` in both DER and VER; a future
v0.2 would need a documented migration note for anything that isn't purely
additive.

## Publication

The repository and release materials are prepared for v0.1.0 publication.
Repository visibility and release/tag creation are separate intentional publication actions.
