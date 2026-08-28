# Deletion Evidence Record — Reference App

A static, browser-only reference implementation. No login, no database, no
backend, no telemetry, no network dependency.

**Runs entirely in your browser. Records are not transmitted or stored by
Michvi.** Schemas and demo scenarios are embedded at build time in
`schemas.embedded.js` / `demos.embedded.js`, so the app requires no network
requests during normal use.

## Run it

Just open `index.html` in a browser — double-click it, or:

```
open reference-app/index.html          # macOS
xdg-open reference-app/index.html       # Linux
```

No server, no build step, no `npm install` required to use the app.

## Screens

1. **Create DER** — fill a form, generate a hashed, schema-valid Deletion
   Evidence Record. Download as JSON or human-readable Markdown.
2. **Create VER** — link to a DER (by ID and pinned hash) and record a
   verification/exception outcome.
3. **Validate Existing Record** — paste any DER/VER JSON and check it
   against the v0.1 schema.
4. **View Linked Evidence Chain** — paste a DER and VER pair and verify the
   hash linkage is intact (or detect a broken/tampered link).
5. **Load Demo Scenario** — six embedded synthetic scenarios from the
   project dataset, for quick exploration.

## Regenerating the embedded files

If you change `/schema/v0.1/*.json` or want different demo scenarios:

```
node reference-app/build-embedded-schemas.js
node reference-app/build-embedded-demos.js
```

## Relationship to `/packages/js`

`lib.js` in this folder is a zero-build, browser-native port of
`/packages/js/src/*`. It is kept behaviorally identical on purpose —
`tests/reference-app-lib.test.js` checks both copies produce the exact same
hash for the same fixed test vector, so they cannot silently drift apart.
