# Kyori

A library that offers many methods to calculate string edit distance.
In addition, it offers the Kyori algorithm, a simple-yet-nice approach to rank
several results against a set of terms (keywords). It is handy when you have search 
results, and you want to return the most relevant lexicographically.

In Japanese, the word for “distance” is 距離 pronounced as **kyori** (きょり).

## Install

Installing the library is simple, just run the following command.

```bash
npm install kyori
```

## Documentation

It provides support for the following methods:

* **Levenshtein Distance**: It measures the minimum number of single-character edits—insertions, deletions, or substitutions—required to change one word into the other. The Levenshtein distance is typically calculated using dynamic programming algorithms like the Wagner-Fischer algorithm.
* **Damerau-Levenshtein Distance**: An extension of the Levenshtein distance, this method also accounts for transpositions (swapping of two adjacent characters) in addition to insertions, deletions, and substitutions. It is particularly useful when transposition errors are common, such as in typographical mistakes.
* **Hamming Distance**: This method calculates the number of positions at which the corresponding characters in two strings of equal length are different. It is only applicable when the strings are of the same length and is often used in error detection and correction algorithms.
* **Smith-Waterman Algorithm**: Similar to the Needleman-Wunsch algorithm but used for local sequence alignment. It finds the optimal local alignment between substrings of the two input strings.
* **Jaro-Winkler Distance**: This method is particularly effective for short strings such as names. It calculates a similarity score based on the number and order of common characters, giving higher scores to strings that match from the beginning.
* **Kyori**: *Work in progress*

Except, *kyori* all the other methods are wrapper on the [talisman library](https://yomguithereal.github.io/talisman/)↗.

## Usage

Using the library is also straightforward. First, you must include the kyori module,

```javascript
const kyori = require('kyori');
```

and then call the appropriate method you want to use.

### Levensthein



```javascript
kyori.distance()
```

### Damerau-Levensthein
