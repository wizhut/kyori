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
* **Kyori**: token-sensitive **ranking** cost for autocomplete. Matching is case-insensitive, folds Latin diacritics, treats hyphens as spaces, prefers word-prefix hits over infix, falls back to Damerau-Levenshtein for typos, charges a flat 1 for the same keywords in a different order, and for typed-prefix completions only charges edits inside the typed span. Use **`kyori.distance`** / **`kyori.rank`** for ordering (**lower** distance is better). Use **`kyori.similarity`** for pairwise token Jaccard (**higher** is better).

## Usage

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
        kyori:              { distance(), similarity(), rank() }
    },
    indices: {
        KyoriIndex
    }
}
```

### Levensthein

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Levenshtein_distance) ↗.

```javascript
const { methods: { levensthein } } = require('@wizhut_tech/kyori');

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
const { methods: { damerau_levensthein } } = require('@wizhut_tech/kyori');

damerau_levensthein.distance('foo', 'foo')  // 0
damerau_levensthein.distance('ab', 'ba')    // 1 (transposition)
damerau_levensthein.distance('foo', null)   // -1
```

### Hamming distance

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Hamming_distance) ↗.
Equal-length strings only.

```javascript
const { methods: { hamming } } = require('@wizhut_tech/kyori');

hamming.distance('foo', 'foo')  // 0
hamming.distance('foo', 'fob')  // 1
hamming.distance('foo', 'food') // -1
```

### Jaro-Winkler

Definition: [Wikipedia](https://en.wikipedia.org/wiki/Jaro–Winkler_distance) ↗.

```javascript
const { methods: { jaro_winkler } } = require('@wizhut_tech/kyori');

jaro_winkler.similarity('foo', 'foo') // 1
jaro_winkler.similarity('foo', 'bar') // 0
jaro_winkler.distance('foo', 'foo')   // 0  (1 − similarity)
```

### Kyori

```javascript
const { methods: { kyori } } = require('@wizhut_tech/kyori');

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

// Order a candidate pool (same scores as distance)
kyori.rank('art', ['cart', 'artist', 'art'])
// [
//   { term: 'art',    score: 0 },
//   { term: 'artist', score: 0 },
//   { term: 'cart',   score: 5 }
// ]
```

### KyoriIndex

`KyoriIndex.search` ranks stored terms with `kyori.rank` (by **distance**,
lowest first; ties broken lexicographically).

```javascript
const { indices: { KyoriIndex } } = require('@wizhut_tech/kyori');

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
