# Contributing to Kyori

Kyori is a small library maintained by one person at [wizhut.tech](https://www.wizhut.tech).
Issues and pull requests are welcome; both are answered on a best-effort basis.

## Reporting a problem

Open an issue at <https://github.com/wizhut/kyori/issues>. Please include:

- the Kyori version (`npm ls @wizhut_tech/kyori`) and the Node.js version;
- the two strings (or the query and the candidate list) you passed in;
- what the method returned and what you expected it to return, with a word
  on why — for `kyori.rank`, which candidate should have come first.

A failing `tap` test case is the most useful report of all.

## Proposing a change

1. Fork the repository and create a branch from `main`.
2. Make the change. The code is plain CommonJS JavaScript with no build
   step: `require` / `module.exports`, `.js` extensions on relative requires,
   no TypeScript, no ESM.
3. Keep the method contract. Every method module exports `distance` (lower
   is better), `similarity` (higher is better) and `rank(query, candidates)`
   returning `{ term, score }[]`; invalid or ineligible input returns `-1`
   where the metric defines it. A new method goes under `src/methods/`, is
   wired into `src/index.js`, gets a `./methods/<name>` subpath in
   `package.json` `exports` and a `__tests__/<name>.test.js`.
4. Add or update tests. The suite lives in `__tests__/` and uses
   [node-tap](https://node-tap.org): one `*.test.js` per module,
   `t.test(name, t => { ...; t.end() })` with `t.equal` / `t.has`.
5. Run the whole suite and make sure it passes:

   ```bash
   npm ci
   npm test
   ```

   A single file: `npx tap __tests__/levensthein.test.js`.

6. Open a pull request against `main` describing what changed and why. If
   the change alters what `kyori.distance` or `kyori.rank` return for some
   input, say so: that is a breaking change for callers that order lists
   with it, and the README's "Upgrading" notes are extended for it.

The spelling `levensthein` in file names and exports is the library's
historical API and is kept on purpose; please do not "fix" it.

## Changes to the Kyori ranking method

The `kyori` method's rules and constants are evaluated in a separate research
tree (<https://github.com/wizhut/kyori-research>) against public corpora
before they ship. A proposal that changes the order `kyori.rank` produces is
best raised as an issue first, with the cases it improves, so it can be
measured there under the same protocol.

## Tests and continuous integration

`.github/workflows/test.yml` runs `npm ci && npm test` on every push and pull
request, on Node.js 20 and 22. The library supports Node.js 14.13 or later.

## Releases

Releases are made by the maintainer and are tag-driven. Pushing a `v<x.y.z>`
tag whose version matches `package.json` runs
`.github/workflows/release.yml`, which runs the tests, publishes
`@wizhut_tech/kyori` to npm through OIDC trusted publishing (with a
provenance attestation; there is no npm token) and opens a GitHub release
with generated notes. Nothing is published from a laptop.

## Licence

By contributing you agree that your contribution is licensed under the
repository's [MIT licence](LICENSE).
