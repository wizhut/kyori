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
* **Needleman-Wunsch Algorithm**: Originally developed for bioinformatics, this dynamic programming approach is used for global sequence alignment. It calculates the optimal alignment by considering insertions, deletions, and substitutions with customizable scoring schemes.
* **Smith-Waterman Algorithm**: Similar to the Needleman-Wunsch algorithm but used for local sequence alignment. It finds the optimal local alignment between substrings of the two input strings.
* **Jaro-Winkler Distance**: This method is particularly effective for short strings such as names. It calculates a similarity score based on the number and order of common characters, giving higher scores to strings that match from the beginning.
* **Kyori**: *Work in progress*

## Usage

Using the library is also straightforward. First, you must include the kyori module, then execute the `kyoriDistance` function.

```javascript
const kyori = require('kyori');
```

