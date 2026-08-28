# Fixed test vectors

`der-vector-0001.json` / `ver-vector-0001.json` are fixed, hand-authored (not
randomly generated) records used to lock in reproducible canonicalization and
hashing behavior. Any conforming implementation, in any language, must produce
the exact canonical string in `*.canonical.txt` and the exact `record_hash`
embedded in the `*.json` file for these inputs.

Regenerate (should produce byte-identical output) with:

```
node tests/vectors/regenerate.js
```
