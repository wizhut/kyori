// Kyori's ranking cost over prepared strings. Not part of the public API:
// kyori.js wraps it as distance / similarity / rank / rankKey, and
// KyoriIndex keeps each term's prepared form so a search folds only the
// query. A string is folded and tokenised once per call, not once per pair
// (0.6.0); the cost's rules are v8's (0.7.0): rules 1-3 as in 0.5.x, rule 4
// reads which typed words the candidate lacks instead of charging its
// length and its words' positions.

const { isNil } = require('@wizhut_tech/wizjs/lang/checks');

const { transliterate: tr } = require('../../common/transliterate.js');

// A run of whitespace or dashes (ASCII hyphen, U+2010–U+2014) becomes one
// space: the same result as turning each dash into a space and then
// collapsing whitespace runs, in one pass.
const SEPARATORS = /[\s\-‐-—]+/g;


function fold(value) {
    if (isNil(value)) {
        return '';
    }

    return tr(value)
        .toLowerCase()
        .replace(SEPARATORS, ' ')
        .trim();
}


/**
 * A string folded once, with its tokens. The fold has no separator left but
 * single spaces, none at either end, so its tokens are the pieces between
 * those spaces: what tokenizeTerm() returns for it, without the regex.
 */
function prepare(value) {
    const text = fold(value);

    return {
        text,
        tokens: text.length === 0 ? [] : text.split(' ')
    };
}


/**
 * Prefix edit distance, as in error-tolerant autocompletion: the smallest OSA
 * Damerau-Levenshtein distance between the typed text and any prefix of the
 * candidate. Same recurrence as damerau_levensthein.distance; only prefixes of
 * up to |typed| + maxEdits characters can come within maxEdits, so the table
 * stops there. Three rows are allocated once and rotated (the transposition
 * term reads two rows back), and the final row is scanned for its minimum.
 */
function prefixEditDistance(typed, text, maxEdits) {
    const m = typed.length;
    const n = Math.min(text.length, m + maxEdits);

    let prev2 = new Int32Array(n + 1);
    let prev = new Int32Array(n + 1);
    let curr = new Int32Array(n + 1);

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    for (let i = 1; i <= m; i++) {
        curr[0] = i;

        for (let j = 1; j <= n; j++) {
            const cost = typed[i - 1] === text[j - 1] ? 0 : 1;
            let best = prev[j] + 1;

            if (curr[j - 1] + 1 < best) {
                best = curr[j - 1] + 1;
            }

            if (prev[j - 1] + cost < best) {
                best = prev[j - 1] + cost;
            }

            if (i > 1 && j > 1 &&
                typed[i - 1] === text[j - 2] &&
                typed[i - 2] === text[j - 1] &&
                prev2[j - 2] + 1 < best) {
                best = prev2[j - 2] + 1;
            }

            curr[j] = best;
        }

        const spare = prev2;

        prev2 = prev;
        prev = curr;
        curr = spare;
    }

    // The rotation leaves the last computed row in `prev` (the initial row
    // when nothing was typed).
    let min = prev[0];

    for (let j = 1; j <= n; j++) {
        if (prev[j] < min) {
            min = prev[j];
        }
    }

    return min;
}


function sameKeywordBag(a, b) {
    if (a.length !== b.length) {
        return false;
    }

    const counts = {};

    for (let i = 0; i < a.length; i++) {
        counts[a[i]] = (counts[a[i]] || 0) + 1;
    }

    for (let i = 0; i < b.length; i++) {
        const key = b[i];

        if (!counts[key]) {
            return false;
        }

        counts[key] -= 1;
    }

    return true;
}


/**
 * Autocomplete cost between two prepared strings. Lower is better (0 = best
 * match). rank() orders by this cost, then by length (shorter first);
 * rankKey() is that order as one number.
 */
function distancePrepared(term, text) {
    const trTerm = term.text;
    const trText = text.text;

    if (trTerm === trText) {
        return 0;
    }

    const termTokens = term.tokens;
    const textTokens = text.tokens;

    // Whole keyword match (same tokens as a bag). Equal bags in equal order
    // would have folded to the same string and returned 0 above, so reaching
    // here means the order differs → flat 1.
    if (termTokens.length > 0 && sameKeywordBag(termTokens, textTokens)) {
        return 1;
    }

    // Autocomplete typed-prefix path: the candidate shares the first character
    // and some prefix of it is within a few edits of the typed text (prefix
    // edit distance) → score only those edits; the unread rest is free. Far
    // prefixes fall through to the word path so later-word hits (e.g. "pizza"
    // in "margherita pizza") are not beaten by unrelated same-initial
    // distractors. Typos are tolerated from the third typed character on, as
    // in Lucene's and Elasticsearch's fuzzy suggesters: none for 1-2
    // characters (where one edit would admit every candidate sharing the
    // first letter), one for 3-5, two for 6-8, and so on.
    const maxEdits = Math.floor(trTerm.length / 3);

    if (trTerm.length > 0 && trTerm[0] === trText[0]) {
        const prefixDist = prefixEditDistance(trTerm, trText, maxEdits);

        if (prefixDist <= maxEdits) {
            return prefixDist;
        }
    }

    // Everything else: rank the candidate by what it shares with the typed
    // words, never by its length. For each typed word, the fewest edits from
    // it to a prefix of any candidate word (0 when it starts a word of the
    // candidate, at most its own length). The cost sits in a tier above every
    // typed-prefix result -- a candidate that lacks a typed word never passes
    // one that extends the typed text -- and inside the tier counts the typed
    // words the candidate lacks, then how far the nearest of them is from a
    // word it has: tier + lacking * (|q| + 1) + nearest edits.
    return wordOverlapCost(termTokens, textTokens, trTerm.length, maxEdits + 1);
}


/**
 * The fewest OSA edits from a typed word to a prefix of any candidate word:
 * 0 when the typed word starts a word of the candidate, at most the word's
 * own length (the cost of deleting it, which is where the search starts and
 * what a candidate with no words gets).
 */
function wordEdits(word, textTokens) {
    let best = word.length;

    for (let i = 0; i < textTokens.length && best > 0; i++) {
        const d = prefixEditDistance(word, textTokens[i], best);

        if (d < best) {
            best = d;
        }
    }

    return best;
}


/**
 * Rule 4 of the cost: the typed words the candidate lacks, then the nearest
 * lacking word's edits, in a tier above every typed-prefix result. A typed
 * word is lacking when no candidate word starts with it; each lacking word
 * costs more than any edit count can (|q| + 1), so the count orders first
 * and the edits order inside it.
 */
function wordOverlapCost(termTokens, textTokens, termLength, tier) {
    const step = termLength + 1;
    let lacking = 0;
    let nearest = 0;

    for (let i = 0; i < termTokens.length; i++) {
        const e = wordEdits(termTokens[i], textTokens);

        if (e > 0) {
            if (lacking === 0 || e < nearest) {
                nearest = e;
            }

            lacking += 1;
        }
    }

    return tier + lacking * step + nearest;
}


/**
 * Token-set Jaccard resemblance of two prepared strings. Higher is better
 * (1 = identical bags). Measures pairwise similarity, not autocomplete ranking
 * cost.
 */
function similarityPrepared(term, text) {
    if (term.text === text.text) {
        return 1;
    }

    const termTokens = term.tokens;
    const textTokens = text.tokens;

    if (termTokens.length === 0 || textTokens.length === 0) {
        return 0;
    }

    const setA = new Set(termTokens);
    const setB = new Set(textTokens);
    let inter = 0;

    for (const token of setA) {
        if (setB.has(token)) {
            inter += 1;
        }
    }

    return inter / (setA.size + setB.size - inter);
}


/**
 * Length tie-breaker for rank(): a value in [0, 1) that grows with the folded
 * candidate's length, so among candidates at the same distance the shorter
 * completion comes first, and candidates at different distances never swap.
 * On a list that already passed a prefix filter the distance is 0 for every
 * exact completion; without this, their order fell to the alphabet.
 */
function lengthTieBreak(foldedLength) {
    return foldedLength / (foldedLength + 1);
}


/**
 * The key rank() sorts by, as one number: distance, then length (shorter
 * first), over prepared strings.
 */
function rankKeyPrepared(term, text) {
    return distancePrepared(term, text) + lengthTieBreak(text.text.length);
}


module.exports = {
    fold,
    prepare,
    distancePrepared,
    similarityPrepared,
    lengthTieBreak,
    rankKeyPrepared
};
