<p align="center">
  <img src="https://raw.githubusercontent.com/wizhut/kyori/main/.github/kyori-icon.png" width="128" height="128" alt="Kyori">
</p>

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

### Why three functions, and what happens if you pick the wrong one

The three answer different questions. A **distance** counts the operations
that turn one string into the other; lower is better. A **similarity** says
what share of the two agrees; higher is better, and identical strings score 1.
A **rank** puts a list of candidates in order for a query, and an order owes
nothing to the metric axioms: it only has to be right. Metric libraries
usually ship the first two for each metric (RapidFuzz does) and leave the
third to the caller; here all three are the contract, so a metric can be
swapped without touching the code around it.

For the classic metrics the first two are duals, and each derives the other
(`distance ≈ 1 − similarity` for Jaro-Winkler; `similarity ≈ 1 − distance / maxLen`
for the edit distances). Kyori's own method refuses the derivation, on purpose:

- `kyori.distance` is a ranking cost, not a metric. It is not symmetric
  (`distance('foo bar', 'foo')` is 14 and the reverse is 0), and it is 0 for
  every candidate that begins with the typed text, so no resemblance can be
  read off it.
- `kyori.similarity` is a different function: the share of words the two
  strings have in common (token Jaccard after fold). It never looks at
  characters, and it knows nothing about what was typed. The cost's last
  rule also reads words, but from the typed side only, with a typo
  tolerance and ranked below every typed-prefix match; neither function is
  derived from the other.

So pick the function by the question. Order a list with `rank`, or sort by
`distance`; measure resemblance with `similarity`. The names are uniform, so
nothing stops you sorting an autocomplete list by `kyori.similarity`, and the
evaluation keeps that mistake as a row: on 11,607 held-out AmazonQAC prefixes
it scores 0.271 in mean reciprocal rank against 0.404 for the cost, a loss of
0.13 (see the [Wizhut Research report](https://research.wizhut.tech/labs/kyori)).
The reverse mistake, reading `kyori.distance` as a resemblance score, has no
row because it cannot be made to mean anything: every prefix match reads as
identical.

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
* **Kyori**: token-sensitive **ranking** cost for autocomplete. Matching is case-insensitive, folds Latin diacritics, treats hyphens as spaces, charges a flat 1 for the same keywords in a different order, for typed-prefix completions charges only the edits between what was typed and the closest prefix of the candidate (prefix edit distance, first character fixed, typos tolerated from the third typed character on), and for everything else counts the typed words the candidate lacks — a word is lacking when no word of the candidate starts with it, a typo away — ranked below every typed-prefix completion, so a candidate's length never counts against it. Use **`kyori.distance`** / **`kyori.rank`** for ordering (**lower** distance is better); `rank` sorts by distance, then by length (shorter completion first), then alphabetically, and **`kyori.rankKey`** is that order as one number. Use **`kyori.similarity`** for pairwise token Jaccard (**higher** is better).

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
kyori.distance('pizza', 'margherita pizza')           // 2 (a later word: the tier above prefix matches)
kyori.distance('foo', 'ifoo')                         // 7 (not a word prefix: one edit to a word that has it)
kyori.distance('foo bar', 'foo')                      // 14 (one typed word lacking)
kyori.distance('fod', 'food')                         // 1 (typed-prefix typo)
kyori.distance('dishwaher', 'dishwasher pods')       // 1 (missed letter; the rest is unread)

// Pairwise resemblance — higher is better (token Jaccard after fold)
kyori.similarity('hotel bel-air', 'bel-air hotel')    // 1
kyori.similarity('foo', 'Foo Bar')                    // 0.5
kyori.similarity('foo', 'food')                       // 0

// Order a candidate pool: by distance, then shorter first (scores are the distances)
kyori.rank('art', ['cart', 'artist', 'art'])
// [
//   { term: 'art',    score: 0 },
//   { term: 'artist', score: 0 },
//   { term: 'cart',   score: 7 }
// ]

// The same order as one number per pair: distance + len/(len+1)
kyori.rankKey('art', 'art')      // 0.75
kyori.rankKey('art', 'artist')   // 0.857…
kyori.rankKey('art', 'cart')     // 7.8
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
//   { term: 'cart',   score: 7 }
// ]
```

## Upgrading from 0.6.x

0.7.0 changes the value `kyori.distance` returns, and so the order
`kyori.rank`, `kyori.rankKey` and `KyoriIndex.search` give, for every pair
the cost's last rule decides: a candidate that is not a typed-prefix
completion of the query (and not the same words in another order). It is a
breaking change to `distance()` for every caller, even though nothing is
renamed, added or removed; `kyori.similarity` and every other method are
unchanged.

Until 0.6.x that rule charged a candidate the difference between its length
and the query's, then each typed word's displacement, and a typo distance
for a word it did not find. A completion that carried the typed words in
another place cost more than an unrelated term of the right length:
`pizza` against `margherita pizza` cost 22, and ranking a whole catalogue
(the `KyoriIndex.search` job) put rephrased completions behind terms that
merely began the same way. Measured on the held-out AmazonQAC sample in the
research tree, where the prefix filter lost the intended completion to a
typo, Kyori's mean reciprocal rank was 0.039 against 0.499 for a
character-trigram cosine.

0.7.0's last rule reads word overlap from the typed side: for each typed
word, the fewest edits from it to a prefix of any word of the candidate
(0 when a candidate word starts with it, at most its own length). The cost
is a tier above every typed-prefix result, `1 + ⌊|q|/3⌋`, plus
`|q| + 1` for each typed word the candidate lacks, plus the nearest lacking
word's edits; the candidate's length never counts, and a candidate that
lacks a typed word never passes one that extends the typed text. On the
filtered pools the library is for, nothing moves (18 of 11 607 held-out
cases change place among the rule-4 terms of their pool); over a whole
catalogue the held-out MRR goes from 0.567 to 0.597, and on the typo
regime from 0.365 to 0.583.

| `distance(query, candidate)` | 0.6.x | 0.7.0 |
|---|---|---|
| `pizza` → `margherita pizza` | 22 | 2 |
| `headphones for ipad kids` → `kids wireless headphones for ipad` | 71 | 9 |
| `foo bar` → `foo` | 7 | 14 |
| `art` → `cart` | 5 | 7 |
| `ab` → `ax pens` | 6 | 5 |
| `null` → `foo` | 3 | 1 |
| `foo` → `food`, `fod` → `food`, `hotel bel-air` → `bel-air hotel` | 0, 1, 1 | 0, 1, 1 |

The research tree's `versions/v8.md` has the change in full and
`versions/algorithm.md` the rules as they now stand.

## Upgrading from 0.5.x

0.6.0 changes no result. Every value `kyori.distance`, `kyori.similarity`,
`kyori.rankKey`, `kyori.rank` and `KyoriIndex.search` return is the one
0.5.1 returned, for the same input; the test suite pins the worked examples,
non-ASCII input and `null`/`undefined` to 0.5.1's values, and the research
tree's ranking, distance and similarity tables are identical to three
decimals. Nothing in the API is added, renamed or removed.

What changed is speed. 0.5.x folded (transliterated, lower-cased, trimmed)
and tokenised each string on every pair: `distance` folded both strings per
call, `rankKey` folded the candidate a second time for its length, and
`rank` folded the query once per candidate. 0.6.0 folds each string once per
call — `rank` folds the query once and each candidate once — and reads the
length tie-break off that fold; `KyoriIndex` folds each term when it is
added, so `search` folds only the query; ASCII strings skip Unicode
normalisation altogether. Measured in the research tree on the 11 607
held-out AmazonQAC pools (median per query, one core of an Apple M4 Max), a
`rankKey` sort went from 120 µs to 52 and `rank()` from 120 µs to 44; on
long product names (Abt–Buy) from 21 ms to 16. The figures and the
protocol are in its `RESULTS.md`, *Efficiency*.

## Upgrading from 0.4.x

0.5.0 changes the order `kyori.rank` returns and the value `kyori.distance`
returns for some inputs. Nothing is renamed or removed; `kyori.rankKey` is
new.

- **`rank` and `KyoriIndex.search`** — candidates at the same distance are
  ordered by length, shorter first, and only then alphabetically. In 0.4.x
  the alphabet decided, and on a list that has already passed a prefix filter
  that is most of the order: every completion of what was typed is at
  distance 0.
- **`distance` on a typed prefix** — the cost is the fewest edits between
  what was typed and *any* prefix of the candidate, so a missed or doubled
  letter costs 1 (`dishwaher` → `dishwasher pods`: 2 in 0.4.x) and the
  candidate may be shorter than what was typed (`food` → `foo`: 2 in 0.4.x).
- **`distance` on one or two typed characters** — a typo is tolerated from
  the third typed character on: none for 1–2, one for 3–5, two for 6–8. A
  two-letter prefix no longer costs 1 against every candidate that shares its
  first letter (`ab` → `ax pens`: 1 in 0.4.x, 6 now).
- **`rankKey(query, candidate)`** — the order `rank` sorts by, as one
  number: `distance + len / (len + 1)`.

`kyori.similarity` and every other method are unchanged.

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

## Support and contributing

Kyori is maintained by one person, on a best-effort basis. Bugs, questions
and proposals go to [GitHub Issues](https://github.com/wizhut/kyori/issues);
the maintainer answers them, usually within a few days, but there is no
service level and no guaranteed response time. Pull requests are welcome:
[CONTRIBUTING.md](CONTRIBUTING.md) says how to report a problem, propose a
change, run the tests (`npm test`) and how releases are cut. The ranking
method's rules and constants are measured in a separate research tree,
[wizhut/kyori-research](https://github.com/wizhut/kyori-research), before
they ship.

# License and usage

Released under MIT license and maintained by [wizhut.tech](https://www.wizhut.tech) ↗.
