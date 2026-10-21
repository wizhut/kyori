---
title: 'Kyori: string distance, similarity and ranking for autocomplete in JavaScript'
tags:
  - JavaScript
  - Node.js
  - string similarity
  - edit distance
  - autocomplete
  - query auto-completion
  - ranking
  - record linkage
authors:
  - name: Vassilios Karakoidas
    orcid: 0009-0001-2263-3453
    corresponding: true
    affiliation: 1
affiliations:
  - name: Wizhut, Athens, Greece
    index: 1
date: 21 October 2026
bibliography: paper.bib
---

# Summary

Kyori is a JavaScript library for comparing strings: the classic edit
distances of Levenshtein, Damerau–Levenshtein and Hamming, the
Jaro–Winkler similarity, and a method of its own, also called Kyori, for
putting an autocomplete list in order. When a user types into a search box, the
application keeps the entries that begin with the typed text and must
order them. Kyori's
method scores each candidate against the typed text with four ordered rules
over folded strings: it tolerates typing errors from the third typed character on,
charges one point when the same words appear in another order, charges a
rephrased completion by the typed words it lacks, and breaks ties by length, shorter completions first. Every method exposes the same
three functions, `similarity`, `distance` and `rank`. The library
is published on npm as `@wizhut_tech/kyori` under the MIT licence,
runs on Node.js 14.13 or later with one runtime dependency, and ships
with 427 test assertions.

# Statement of need

Three tasks share the vocabulary of closeness. Record linkage asks how
much two names or titles resemble each other [@fellegi1969]; spelling
correction how many edits separate a mistyped word from the intended one
[@damerau1964]; query auto-completion (QAC) in what order completions
should appear once the typed prefix has selected them [@baryossef2011].
Levenshtein counted insertions, deletions and
substitutions [@levenshtein1966], Damerau added the transposition
[@damerau1964], Jaro and Winkler rewarded agreeing characters and a shared
prefix [@jaro1989; @winkler1990], Jaccard compared word sets
[@jaccard1912], and Cohen, Ravikumar and Fienberg compared the family by
how well each ranks the true match [@cohen2003]. Autocompletion added the
most popular completion over a prefix tree [@baryossef2011] and error
tolerance through the edit distance from the typed text to a prefix of each
completion [@chaudhuri2009], shipped in Lucene's fuzzy suggester [@lucene3846].

A JavaScript application that must order a filtered list chooses among
libraries that each answer with one scalar meant for another job: a
pairwise similarity, an edit distance, or a typeahead score with one fixed
policy and no published measurement of its order. Developers
get the classic measures behind one contract and a ranking cost for the
order-after-filter step; researchers a method whose every rule is traced
to its precedent and an evaluation tree measuring it against eleven
alternatives and two ablations with QAC's ordering metrics [@kyoriresearch].

# State of the field

Learned models have reached string comparison: neural entity matching on
the Magellan suites [@mudgal2018] and generative query auto-completion with
AmazonQAC as its benchmark [@everaert2024]. A deterministic method offers
what a model does not: no training data, no parameters, an order a rule can
explain. In JavaScript, Talisman [@plique2020], natural [@natural] and
fastest-levenshtein [@fastestlevenshtein] return a pairwise score and
nothing about order. The typeahead libraries order lists, each by one policy: Fuse.js [@fusejs] weights a Bitap match [@baezayates1992] by its
location and the field's length; fuzzysort
[@fuzzysort] scores a subsequence match less the candidate's length;
match-sorter [@matchsorter] sorts by tier, each tier alphabetical.
Outside JavaScript, RapidFuzz [@rapidfuzz] and stringdist [@vanderloo2014]
are metric collections and pg_trgm [@pgtrgm] ranks inside a search engine.
The hosted engines Algolia [@algolia2026], Meilisearch [@meilisearch2026]
and Typesense [@typesense2026] rank by a ladder with the typo count at or
near its top, a per-word allowance capped at two, and remaining ties to
weight or a custom order.

Kyori was built rather than contributed: the metric libraries have no
ranking contract to extend, and the typeahead libraries embed one policy
behind their own filter. Its cost is a ladder of
the engines' kind with three differences: the allowance grows with the
typed length where theirs stop at two, it has no popularity or weight
term, and its ties fall to length, shorter first. Among the
JavaScript libraries, as far as the author knows, it alone publishes a
measurement of its order.

# Software design

Every method module implements the interface in \autoref{fig:api}:
`distance`, `similarity` and `rank`, one per question asked of two
strings: how many operations turn one into the other (a count, lower
better); what share agrees (a proportion, higher better); and which
candidate comes first for a query, an order owing nothing to the metric
axioms. RapidFuzz
[@rapidfuzz] exposes the first two per metric and leaves the third to a
helper; here all three are the contract. A method with one of the first
two derives the other, and ineligible input (Hamming on unequal lengths)
sorts last; Kyori's own method refuses the derivation. Its cost is not a
metric (`distance('foo bar', 'foo')` is 14 and the reverse is 0) and it is 0
for every candidate that begins with the typed text, so no similarity can
be read off it; its `similarity` is instead the Jaccard index
of the two folded word sets. Uniform names let a caller sort by the wrong
function; the evaluation keeps that row, 0.13 of mean reciprocal rank (MRR) below
the cost.

![The method interface and its implementations.\label{fig:api}](api.png)

The cost has four rules, each with a precedent. Both strings are folded
first (Latin letters to ASCII, lower case, dashes to spaces, whitespace
collapsed); with $q$ and $t$ the folded query and candidate, the first rule
that applies returns. Identity costs 0. The same
words in another order cost 1, where sorted-Winkler [@christen2006] and
FuzzyWuzzy's token sort [@fuzzywuzzy] charge nothing. If the first
characters agree, the typed-prefix rule returns the prefix edit distance,
the least Damerau–Levenshtein distance between $q$ and any prefix of $t$
[@chaudhuri2009], when within $\lfloor |q|/3 \rfloor$ edits, none below
three typed characters; threshold and fixed first character are Lucene's
suggester's. Otherwise, since 0.7.0, the cost reads word
overlap from the typed side: for each typed word, the fewest edits to a
prefix of any candidate word. It is one tier above every typed-prefix
result, $1 + \lfloor |q|/3 \rfloor$, plus $|q| + 1$ per typed word the
candidate lacks, plus the nearest lacking word's edits; the candidate's
length never counts, and nothing lacking a typed word passes a candidate
that extends the typed text. Its precedents are match-sorter's word-start
tier and the token methods' shared-word counts [@fuzzywuzzy; @cohen2003],
read from one side and unweighted. `rank` sorts by the cost and then by
length, shorter first, a preference Fuse.js, fuzzysort and `ORDER BY
length` all carry; the alphabetical fallback is credited nowhere in the
evaluation. It has no weights, frequency data or index: popularity, the
strongest signal in QAC [@baryossef2011], is left to the caller, who has
the logs.

The evaluation tree scores every contestant through its contract on eight
groups from six public datasets, one held out from the design, a
20 000-row sample of the AmazonQAC train split
[@everaert2024], with pools exactly what a typo-tolerant prefix filter
returns, nothing planted or sampled [@krichene2020]. Ties are
expectations under random order [@mcsherry2008], reported with the band a
tie policy alone could move. Held out, Kyori's `rank`
is level with fuzzysort, Fuse.js and sorting by length, no difference
surviving Holm correction; it leads match-sorter by
0.028 and its own cost without the tie-break by 0.036 (both $p < 0.01$),
and trails the most popular completion by 0.018. The fourth rule
moves nothing there (0.404 before and after 0.7.0); on held-out groups
built so the rules decide, ranking the whole catalogue rises from 0.567 to
0.597, past Fuse.js at 0.579, and the queries the prefix filter lost to a
typo from 0.365 to 0.583, 0.030 behind a character-trigram cosine, each
gap confirmed once on the test split.
The design lost elsewhere: as a resemblance
score on product titles Kyori's token Jaccard trails a character-trigram
cosine by 0.172 on Abt–Buy [@koepcke2010] and Soft-TFIDF by 0.063 on
Amazon–Google [@cohen2003]; on misspellings [@norvig2009] its
cost trails Jaro–Winkler by 0.039; and it is slow: 52 µs a query at the
median on 0.6.0 (0.5.1 took 120; 0.7.0 is not timed again), against 19 to
27 µs for fuzzysort and sorting by length on one core of an Apple M4 Max
under Node.js 26.8. On a filtered list a cost of known parts orders as well
as what applications already use, no better and more slowly, and
popularity decides what remains; the fourth rule matters only where the
filter has not.

: Expected MRR on the held-out AmazonQAC pools ($n = 11\,607$), the band a
tie policy alone could move it within, and the share of cases in which the
intended completion is tied. The ranking task alone: every contestant is
used as the sort key its contract gives, distances ascending and
similarities descending, so the distance and similarity rows show what
sorting a filtered list by those functions costs, not how well they do
their own job; those tasks are reported in the text. Popularity is
available only to the most popular completion.

| Method                          |   MRR | Band        | Ties |
|:--------------------------------|------:|:-----------:|-----:|
| Most popular completion         | 0.422 | 0.413–0.448 |  18% |
| Kyori `rank`                    | 0.404 | 0.393–0.416 |  47% |
| fuzzysort 4.0                   | 0.403 | 0.390–0.421 |  47% |
| `LIKE 'q%' ORDER BY length`     | 0.403 | 0.385–0.441 |  50% |
| Fuse.js 7.5                     | 0.402 | 0.355–0.499 |  66% |
| match-sorter 8.3                | 0.376 | 0.276–0.942 |  82% |
| Kyori cost without tie-break    | 0.368 | 0.257–0.989 |  85% |
| Character-trigram cosine        | 0.365 | 0.364–0.411 |  15% |
| Jaro–Winkler                    | 0.353 | 0.343–0.365 |  48% |
| Kyori `similarity` as key       | 0.271 | 0.210–0.706 |  82% |
| Damerau–Levenshtein             | 0.257 | 0.245–0.272 |  64% |

# Research impact statement

The evidence of use is the author's own research. The library has
been on npm since October 2024, through 23 versions to 0.7.0, with about
860 registry downloads in the month to 20 October 2026; the repository
has been public since September 2024 with its tests run on every push,
one author and no external contributors yet. Each of the method's eight
versions was measured by the evaluation tree, the last confirmed once on
the test split, and the tree is published with the library
[@kyoriresearch]: the harness,
the generators that adapt the Magellan suites [@konda2016] and build the
pools, the significance tests, the efficiency benchmark and the results
file this paper's numbers come from. The harness takes another ranker as one function from query and
candidate to a sort key, so an unmeasured library is one more row; that
part is the likeliest to be reused. The finding concerns the field more than Kyori: a filtered autocomplete
list's order comes from a length prior every competitive method carries,
and popularity decides what that prior leaves tied.

# AI usage disclosure

Kyori was written without generative AI from September 2024 (0.0.1) to
January 2025 (0.1.1), modelled on Talisman [@plique2020], whose
Damerau–Levenshtein it wrapped and whose tests it followed. AI
assistance began in May 2026 and reached the code with release 0.2.0 in
August 2026: Anthropic's Claude
models through Claude Code, and the Cursor and Google Antigravity agents,
contributed the native metrics that replaced Talisman, refactoring, test
scaffolding, documentation and the release workflow, and in the evaluation tree the harness,
baselines, corpus adaptations, significance tests and efficiency benchmark. This manuscript was
drafted by Claude Fable 5.1 in Claude Code and revised by the author. The problem framing, the three-contract
design, the four rules and their constants, the evaluation protocol and the
reading of every result are the author's decisions. The author reviewed,
ran and edited every AI-assisted output; every number here is produced by
the committed harness, none by a model.

# Acknowledgements

No external funding; the library and its evaluation were
developed at Wizhut, the author's company, which had no further role.
AmazonQAC is used under its CDLA-Permissive-2.0 licence; the
entity-matching suites are the University of Wisconsin–Madison's Magellan
and DeepMatcher mirrors; the spelling errors Peter Norvig's aggregation of
the Birkbeck lists.

# References
