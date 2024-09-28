# Kyori

A library that offers many algorithms to calculate string edit distance.
In addition, it offers the Kyori algorithm, a simple-yet-nice approach to rank
several results against a set of terms (keywords). It is handy when you have search 
results and you want to return the most lexicographically relevant.

In Japanese, the word for “distance” is 距離 pronounced as **kyori** (きょり).

## Install

Installing the library is simple, just run the following command.

```bash
npm install kyori
```

## Usage

Using the library is also straightforward. First, you must include the kyori module, then execute the `kyoriDistance` function.

```javascript
const kyori = require('kyori');

kyori('foo', 'foo') // => this return 0, which means the strings are identical
```

