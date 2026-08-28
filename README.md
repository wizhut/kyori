# Kyori

A library that offers many methods to calculate string edit distance.
In addition, it offers the Kyori algorithm, a simple-yet-nice approach to rank
several results against a set of terms (keywords). It is handy when you have search
results, and you want to return the most relevant lexicographically.

In Japanese, the word for “distance” is 距離 pronounced as **kyori** (きょり).

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

It provides support for the following methods for edit string distance:

* **Levenshtein**: It measures the minimum number of single-character edits—insertions, deletions, or substitutions—required to change one word into the other.
* **Damerau-Levenshtein**: An extension of the Levenshtein distance, this method also accounts for transpositions (swapping of two adjacent characters) in addition to insertions, deletions, and substitutions. It is particularly useful when transposition errors are common, such as in typographical mistakes.
* **Hamming Distance**: This method calculates the number of positions at which the corresponding characters in two strings of equal length are different. It is only applicable when the strings are of the same length and is often used in error detection and correction algorithms.

... and for string similarity:

* **Jaro-Winkler**: This method is particularly effective for short strings such as names. It calculates a similarity score based on the number and order of common characters, giving higher scores to strings that match from the beginning.
* **Kyori**: A similarity method that is token sensitive and focus of the similarity of a term to a specific text. It is ideal to rank results for autocomplete interfaces. Matching is case-insensitive, folds Latin diacritics, treats hyphens as spaces, prefers word-prefix hits over infix, and falls back to Damerau-Levenshtein for typos. **Lower is better** (0 = best match).

All methods are implemented natively in this library.

## Usage

Using the library is also straightforward. First, you must include the top-level kyori module,

```javascript
const { methods, indices } = require('@wizhut_tech/kyori');
```

the object is structured as followed:

```text
{
    methods: {
        levensthein: { distance() },
        damerau_levensthein: { distance() },
        hamming: { distance() },
        jaro_winkler: { similarity() },
        kyori: { similarity() }
    },
    indices: {
        KyoriIndex
    }
}
```

and then call the appropriate method you want to use. You can also include the desired method directly.

### Levensthein

Definition can be found [here](https://en.wikipedia.org/wiki/Levenshtein_distance) ↗. This metric is natively implemented.

```javascript
const { methods: { levensthein } } = require('@wizhut_tech/kyori');
```

*Example*:

```javascript
levensthein.distance('foo', 'foo')  // should be 0
levensthein.distance('foo', 'food') // should be 1
levensthein.distance('foo', null)   // should be -1
```

### Damerau-Levensthein

Definition can be found [here](https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance) ↗. This metric is natively implemented.

```javascript
const { methods: { damerau_levensthein } } = require('@wizhut_tech/kyori');
```

*Example*:

```javascript
damerau_levensthein.distance('foo', 'foo');   // should be 0
damerau_levensthein.distance('foo', 'food');  // should be 1
damerau_levensthein.distance('ab', 'ba');     // should be 1 (transposition)
damerau_levensthein.distance('foo', null);    // should be -1
```

### Hamming distance

Definition can be found [here](https://en.wikipedia.org/wiki/Hamming_distance) ↗. This metric is natively implemented.

```javascript
const { methods: { hamming } } = require('@wizhut_tech/kyori');
```

*Usage*:

Keep in mind that hamming distance works only for string with same length.

```javascript
hamming.distance('foo', 'foo')  // should be 0
hamming.distance('foo', 'fob')  // should be 1
hamming.distance('foo', 'food') // should be -1
```

### Jaro-Winkler

Definition can be found [here](https://en.wikipedia.org/wiki/Jaro–Winkler_distance) ↗.

```javascript
const { methods: { jaro_winkler } } = require('@wizhut_tech/kyori');
```

*Usage*:

```javascript
jaro_winkler.similarity('foo', 'foo') // should be 1
jaro_winkler.similarity('foo', 'bar') // should be 0
```

### Kyori

```javascript
const { methods: { kyori } } = require('@wizhut_tech/kyori');
```

*Usage*:

```javascript
kyori.similarity('foo', 'foo')         // should be 0
kyori.similarity('foo', 'food')        // should be 1 (prefix)
kyori.similarity('foo', 'ifoo')        // should be 5 (not a word prefix)
kyori.similarity('Foo', 'foo')         // should be 0 (case-insensitive)
kyori.similarity('foo-bar', 'foo bar') // should be 0
kyori.similarity('fod', 'food')        // should be 2 (typo)
```

### KyoriIndex

`KyoriIndex` ranks stored terms with `kyori.similarity`. `search` returns `{ term, score }[]`, lowest score first (ties broken lexicographically).

```javascript
const { indices: { KyoriIndex } } = require('@wizhut_tech/kyori');

const index = new KyoriIndex();
index.addMany(['cart', 'artist', 'art']);
index.search('art');
// [
//   { term: 'art',    score: 0 },
//   { term: 'artist', score: 3 },
//   { term: 'cart',   score: 5 }
// ]
```

# License and usage

Released under MIT license and maintained by [wizhut.tech](https://www.wizhut.tech) ↗.
