# Contributing to Deletion Evidence Record

Thanks for considering a contribution. This project is a small, focused open
specification and reference implementation — contributions that keep it that
way are especially welcome.

## Before you contribute

This project is separate from Michvi LLP's confidential advisory
engagements and internal methodologies. Please do not submit anything that:

- references Michvi's internal tools, product names, or internal
  identifiers not already publicly documented here;
- claims regulatory compliance, certification, or endorsement on the
  project's behalf;
- includes real personal data, real customer data, or real organization
  names in examples, tests, or the dataset.

## Ways to contribute

- **Schema feedback** — open an issue proposing a field change. Because
  `additionalProperties: false` is used throughout, schema changes are
  breaking changes; discuss before submitting a PR.
- **Dataset scenarios** — new synthetic scenario families or edge cases are
  welcome. All dataset contributions must be entirely synthetic — see
  `dataset/generate.js` for the existing pattern.
- **Reference implementation** — bug fixes, additional language ports, or
  reference-app improvements.
- **Documentation** — clarifications to the spec, README, or examples.

## Development setup

```bash
git clone https://github.com/michvi-open/deletion-evidence.git
cd deletion-evidence
node --test "tests/**/*.test.js"
```

No `npm install` is required for the core package (`packages/js` has zero
runtime dependencies).

## Making a change

1. Fork and branch from `main`.
2. If you change `/schema/v0.1/*.json`, regenerate the embedded reference-app
   copies: `node reference-app/build-embedded-schemas.js`.
3. If you change the dataset generator, regenerate: `node dataset/generate.js`
   then `node examples/generate-examples.js`.
4. Add or update tests in `/tests`. All tests must pass:
   `node --test $(find tests -name '*.test.js' -type f | sort)`.
5. Open a pull request describing what changed and why.

## Code style

- Plain JavaScript (CommonJS), no build step, no bundler.
- Zero runtime dependencies in `packages/js` and `reference-app` — if a
  change would require adding one, raise it in an issue first.
- Keep `reference-app/lib.js` behaviorally identical to `packages/js/src/*`
  — `tests/reference-app-lib.test.js` checks this against a fixed hash
  vector; a change to one without the other will fail CI.

## Reporting issues

Use GitHub Issues. For security-sensitive reports, see `SECURITY.md`
instead of opening a public issue.

## License of contributions

By contributing, you agree your contribution is licensed under the same
terms as the relevant part of the project (see `README.md` § Licensing —
the applicable project licensing terms).
