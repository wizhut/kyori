# Kyori

A library of string **distance**, **similarity**, and **rank** methods.
In addition, it offers the Kyori algorithm — a simple-yet-nice approach to
order candidates against a query (handy for autocomplete and “best match”
ordering after a filter).

In Japanese, the word for “distance” is 距離 pronounced as **kyori** (きょり).

## Uniform API

Every method exposes the same three functions:

| Method | Meaning | Sort for ranking |
|---|---|---|
| `similarity(a, b)` | pairwise resemblance | **higher** is better |
| `distance(a, b)` | edit / cognitive cost | **lower** is better |
| `rank(query, candidates)` | order a pool for a query | returns `{ term, score }[]` |

Competitors derive the dual where needed (`distance ≈ 1 − similarity` for
Jaro-Winkler; `similarity ≈ 1 − distance / maxLen` for edit metrics).
Kyori keeps them **conceptually separate**: `distance` is the autocomplete /
ranking cost; `similarity` is token-set Jaccard resemblance after fold.

Invalid or ineligible inputs return `-1` from `distance` / `similarity`
where that metric defines it (e.g. Hamming on unequal lengths). `rank`
sorts ineligible scores last.

## Install

```bash
npm install @wizhut_tech/kyori
```

## Run unit tests

To execute locally the testing suite, just execute:

```bash
npm test
```

## Implemented methods

Edit-distance family (native):

* **Levenshtein**: minimum insertions, deletions, or substitutions to change one string into the other.
* **Damerau-Levenshtein**: Levenshtein plus adjacent transpositions (common typo).
* **Hamming**: positions that differ; equal length only (`-1` otherwise).

Similarity / ranking family (native):

* **Jaro-Winkler**: short-string resemblance (names); higher similarity is better.
* **Kyori**: token-sensitive **ranking** cost for autocomplete. Matching is case-insensitive, folds Latin diacritics, treats hyphens as spaces, prefers word-prefix hits over infix, falls back to Damerau-Levenshtein for typos, charges a flat 1 for the same keywords in a different order, and for typed-prefix completions only charges edits inside the typed span. Use **`kyori.distance`** / **`kyori.rank`** for ordering (**lower** distance is better); `rank` sorts by distance, then by length (shorter completion first), then alphabetically, and **`kyori.rankKey`** is that order as one number. Use **`kyori.similarity`** for pairwise token Jaccard (**higher** is better).

## Usage

Import just the method you need:

```javascript
const { levensthein } = require('@wizhut_tech/kyori/methods/levensthein');
const { kyori } = require('@wizhut_tech/kyori/methods/kyori');
const { KyoriIndex } = require('@wizhut_tech/kyori/indices/kyori');
```

Every method listed above is reachable as `@wizhut_tech/kyori/methods/<name>`,
using the same flat names the `methods` namespace uses -- the `edit_distance/`
and `similarity/` split is an internal detail and does not appear in the path.
The subpath form needs Node 14.13 or newer.

The whole library is also available from a single root import:

```javascript
const { methods, indices } = require('@wizhut_tech/kyori');
```

Shape:

```text
{
    methods: {
        levensthein:        { distance(), similarity(), rank() },
        damerau_levensthein:{ distance(), similarity(), rank() },
        hamming:            { distance(), similarity(), rank() },
        jaro_winkler:       { similarity(), distance(), rank() },
        kyori:              { distance(), similarity(), rank(), rankKey() }
    },
    indices: {
        KyoriIndex
    }
}
```

Both forms hand back the same objects, so they mix freely. Shared internals
(under `src/common/`) are deliberately not reachable as subpaths.

### Levensthein

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Levenshtein_distance) ↗.

```javascript
const { levensthein } = require('@wizhut_tech/kyori/methods/levensthein');

levensthein.distance('foo', 'foo')   // 0
levensthein.distance('foo', 'food')  // 1
levensthein.similarity('foo', 'food') // 0.75
levensthein.rank('foo', ['food', 'foo'])
// [ { term: 'foo', score: 0 }, { term: 'food', score: 1 } ]
levensthein.distance('foo', null)    // -1
```

### Damerau-Levensthein

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance) ↗.

```javascript
const { damerau_levensthein } = require('@wizhut_tech/kyori/methods/damerau_levensthein');

damerau_levensthein.distance('foo', 'foo')  // 0
damerau_levensthein.distance('ab', 'ba')    // 1 (transposition)
damerau_levensthein.distance('foo', null)   // -1
```

### Hamming distance

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Hamming_distance) ↗.
Equal-length strings only.

```javascript
const { hamming } = require('@wizhut_tech/kyori/methods/hamming');

hamming.distance('foo', 'foo')  // 0
hamming.distance('foo', 'fob')  // 1
hamming.distance('foo', 'food') // -1
```

### Jaro-Winkler

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Jaro–Winkler_distance) ↗.

```javascript
const { jaro_winkler } = require('@wizhut_tech/kyori/methods/jaro_winkler');

jaro_winkler.similarity('foo', 'foo') // 1
jaro_winkler.similarity('foo', 'bar') // 0
jaro_winkler.distance('foo', 'foo')   // 0  (1 − similarity)
```

### Kyori

```javascript
const { kyori } = require('@wizhut_tech/kyori/methods/kyori');

// Ranking / autocomplete cost — lower is better
kyori.distance('foo', 'foo')                          // 0
kyori.distance('foo', 'food')                         // 0 (typed prefix; unread suffix free)
kyori.distance('chore lo', 'chore list for wall')     // 1
kyori.distance('hotel bel-air', 'bel-air hotel')      // 1 (same keywords, order)
kyori.distance('foo', 'ifoo')                         // 5 (not a word prefix)
kyori.distance('fod', 'food')                         // 1 (typed-prefix window typo)

// Pairwise resemblance — higher is better (token Jaccard after fold)
kyori.similarity('hotel bel-air', 'bel-air hotel')    // 1
kyori.similarity('foo', 'Foo Bar')                    // 0.5
kyori.similarity('foo', 'food')                       // 0

// Order a candidate pool: by distance, then shorter first (scores are the distances)
kyori.rank('art', ['cart', 'artist', 'art'])
// [
//   { term: 'art',    score: 0 },
//   { term: 'artist', score: 0 },
//   { term: 'cart',   score: 5 }
// ]

// The same order as one number per pair: distance + len/(len+1)
kyori.rankKey('art', 'art')      // 0.75
kyori.rankKey('art', 'artist')   // 0.857…
kyori.rankKey('art', 'cart')     // 5.8
```

### KyoriIndex

`KyoriIndex.search` ranks stored terms with `kyori.rank` (by **distance**,
lowest first; ties broken by length, shorter first, then lexicographically).

```javascript
const { KyoriIndex } = require('@wizhut_tech/kyori/indices/kyori');

const index = new KyoriIndex();
index.addMany(['cart', 'artist', 'art']);
index.search('art');
// [
//   { term: 'art',    score: 0 },
//   { term: 'artist', score: 0 },
//   { term: 'cart',   score: 5 }
// ]
```

## Upgrading from 0.2.x

`kyori.similarity` changed meaning. In 0.2.x it returned the autocomplete
ranking **cost** (lower is better); it now returns token-set Jaccard
**resemblance** (higher is better). The old behaviour moved to
`kyori.distance`:

```javascript
kyori.similarity(q, c)   // 0.2.x ranking cost
kyori.distance(q, c)     // 0.3.0 — same behaviour, plus keyword-order
                         //         and typed-prefix handling
```

`KyoriIndex.search` is unaffected: it still returns `{ term, score }[]`
ordered best-first. Every other method gained `similarity`, `distance`, and
`rank` without changing what it already returned.

# License and usage

Released under MIT license and maintained by [wizhut.tech](https://www.wizhut.tech) ↗.
