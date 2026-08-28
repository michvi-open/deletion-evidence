# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/).

## [0.1.0]

### Added

- Initial DER (Deletion Evidence Record) and VER (Verification / Exception
  Record) JSON Schema v0.1, with closed vocabularies for request type,
  execution status, and verification status.
- Deterministic canonicalization + SHA-256 hashing specification and
  reference implementation (`der-ver-canonical-json-v0.1`).
- Zero-dependency JS reference package (`packages/js`):
  `canonicalize`, `computeRecordHash`, `sealRecord`, `verifyLink`,
  `validateDER`, `validateVER`, `renderRecord`.
- 320-scenario synthetic dataset across 20 scenario families, 183 with
  linked VER records, plus 12 deliberately invalid fixtures for validator
  testing (`dataset/`).
- Curated `examples/positive`, `examples/negative`, `examples/flagship`.
- Static, browser-only reference app with 5 screens (`reference-app/`).
- 50-test suite covering schema validity, hash determinism, tamper
  detection, closed-vocabulary rejection, malformed/missing fields, and
  reference-app/package parity (`tests/`).
- Project documentation: README, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT,
  this file, and release notes.

### Known limitations at this version

- The JavaScript package remains private and is not published to npm.
- No independent security review is claimed for v0.1.0.
