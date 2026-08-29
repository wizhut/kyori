const { lang } = require('@wizhut_tech/wizjs');

const { transliterate: tr } = require('../../common/transliterate.js');
const { tokenizeTerm } = require('../../common/tokenize.js');
const { damerau_levensthein } = require('../edit_distance/damerau_levensthein.js');
const { rankByDistance } = require('../../common/method_api.js');

const DASH = /[\-\u2010-\u2014]/g;


function fold(value) {
    if (lang.checks.isNil(value)) {
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
 * Prefer this (or rank) when ordering candidates for a query.
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

    // Autocomplete typed-prefix path: candidate is at least as long, shares the
    // first character, and the leading |Q| window is a near match → score only
    // edits inside that window (unread suffix free). Far windows fall through
    // to the token path so mid-string hits (e.g. "tikka" in a longer title)
    // are not beaten by unrelated same-initial distractors.
    if (trTerm.length > 0 && trText.length >= trTerm.length && trTerm[0] === trText[0]) {
        const windowDist = damerau_levensthein.distance(trTerm, trText.slice(0, trTerm.length));
        const maxWindowEdits = Math.max(1, Math.floor(trTerm.length / 3));

        if (windowDist <= maxWindowEdits) {
            return windowDist;
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


function fn_rank(query, candidates) {
    return rankByDistance(fn_distance, query, candidates);
}


module.exports = {
    kyori: {
        distance: fn_distance,
        similarity: fn_similarity,
        rank: fn_rank
    }
};
