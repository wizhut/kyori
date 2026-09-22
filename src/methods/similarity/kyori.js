const { isNil } = require('@wizhut_tech/wizjs/lang/checks');

const { transliterate: tr } = require('../../common/transliterate.js');
const { tokenizeTerm } = require('../../common/tokenize.js');
const { damerau_levensthein } = require('../edit_distance/damerau_levensthein.js');
const { rankByDistance } = require('../../common/method_api.js');

const DASH = /[\-\u2010-\u2014]/g;


function fold(value) {
    if (isNil(value)) {
        return '';
    }

    return tr(value)
        .toLowerCase()
        .replace(DASH, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}


function isWordStart(text, index) {
    return index === 0 || text[index - 1] === ' ';
}


function findToken(text, token) {
    let from = 0;
    let infix = -1;

    while (from + token.length <= text.length) {
        const idx = text.indexOf(token, from);

        if (idx === -1) {
            break;
        }

        if (isWordStart(text, idx)) {
            return { index: idx, prefix: true };
        }

        if (infix === -1) {
            infix = idx;
        }

        from = idx + 1;
    }

    if (infix !== -1) {
        return { index: infix, prefix: false };
    }

    return { index: -1, prefix: false };
}


function typoPenalty(token, text) {
    const textTokens = tokenizeTerm(text);
    let best = token.length;

    for (let i = 0; i < textTokens.length; i++) {
        const d = damerau_levensthein.distance(token, textTokens[i]);

        if (d < best) {
            best = d;
        }
    }

    return best;
}


/**
 * Prefix edit distance, as in error-tolerant autocompletion: the smallest OSA
 * Damerau-Levenshtein distance between the typed text and any prefix of the
 * candidate. Same recurrence as damerau_levensthein.distance; only prefixes of
 * up to |typed| + maxEdits characters can come within maxEdits, so the table
 * stops there.
 */
function prefixEditDistance(typed, text, maxEdits) {
    const m = typed.length;
    const n = Math.min(text.length, m + maxEdits);

    let prev2 = [];
    let prev = [];

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    let curr = prev;

    for (let i = 1; i <= m; i++) {
        curr = [i];

        for (let j = 1; j <= n; j++) {
            const cost = typed[i - 1] === text[j - 1] ? 0 : 1;

            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + cost
            );

            if (i > 1 && j > 1 &&
                typed[i - 1] === text[j - 2] &&
                typed[i - 2] === text[j - 1]) {
                curr[j] = Math.min(curr[j], prev2[j - 2] + 1);
            }
        }

        prev2 = prev;
        prev = curr;
    }

    return Math.min(...curr);
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
 * Cognitive / autocomplete cost. Lower is better (0 = best match).
 * rank() orders by this cost, then by length (shorter first); rankKey() is
 * that order as one number.
 */
function fn_distance(terms, text) {
    if (terms === text) {
        return 0;
    }

    const trTerm = fold(terms);
    const trText = fold(text);

    if (trTerm === trText) {
        return 0;
    }

    const termTokens = tokenizeTerm(trTerm);
    const textTokens = tokenizeTerm(trText);

    // Whole keyword match (same tokens as a bag). Equal bags in equal order
    // would have folded to the same string and returned 0 above, so reaching
    // here means the order differs → flat 1.
    if (termTokens.length > 0 && sameKeywordBag(termTokens, textTokens)) {
        return 1;
    }

    // Autocomplete typed-prefix path: the candidate shares the first character
    // and some prefix of it is within a few edits of the typed text (prefix
    // edit distance) → score only those edits; the unread rest is free. Far
    // prefixes fall through to the token path so mid-string hits (e.g. "tikka"
    // in a longer title) are not beaten by unrelated same-initial distractors.
    // Typos are tolerated from the third typed character on, as in Lucene's
    // and Elasticsearch's fuzzy suggesters: none for 1-2 characters (where one
    // edit would admit every candidate sharing the first letter), one for 3-5,
    // two for 6-8, and so on.
    if (trTerm.length > 0 && trTerm[0] === trText[0]) {
        const maxEdits = Math.floor(trTerm.length / 3);
        const prefixDist = prefixEditDistance(trTerm, trText, maxEdits);

        if (prefixDist <= maxEdits) {
            return prefixDist;
        }
    }

    let score = Math.abs(trText.length - trTerm.length);

    for (let i = 0; i < termTokens.length; i++) {
        const token = termTokens[i];
        const found = findToken(trText, token);

        if (found.index === -1) {
            score += typoPenalty(token, trText);
            continue;
        }

        const termIndex = trTerm.indexOf(token);

        score += Math.abs(found.index - termIndex);

        if (!found.prefix) {
            score += token.length;
        }
    }

    return score;
}


/**
 * Token-set Jaccard resemblance after fold. Higher is better (1 = identical bags).
 * Measures pairwise similarity, not autocomplete ranking cost.
 */
function fn_similarity(terms, text) {
    const trTerm = fold(terms);
    const trText = fold(text);

    if (trTerm === trText) {
        return 1;
    }

    const termTokens = tokenizeTerm(trTerm);
    const textTokens = tokenizeTerm(trText);

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
function lengthTieBreak(text) {
    const len = fold(text).length;

    return len / (len + 1);
}


/**
 * The key rank() sorts by, as one number: distance, then length (shorter
 * first). Use it to order candidates yourself with a single score per pair.
 */
function fn_rank_key(terms, text) {
    return fn_distance(terms, text) + lengthTieBreak(text);
}


function fn_rank(query, candidates) {
    return rankByDistance(fn_distance, query, candidates, (q, term, distance) => distance + lengthTieBreak(term));
}


module.exports = {
    kyori: {
        distance: fn_distance,
        similarity: fn_similarity,
        rank: fn_rank,
        rankKey: fn_rank_key
    }
};
