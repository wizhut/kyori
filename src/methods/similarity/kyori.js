const { lang } = require('@wizhut_tech/wizjs');

const { transliterate: tr } = require('../../common/transliterate.js');
const { tokenizeTerm } = require('../../common/tokenize.js');
const { damerau_levensthein } = require('../edit_distance/damerau_levensthein.js');

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


function fn_similarity(terms, text) {
    if (terms === text) {
        return 0;
    }

    const trTerm = fold(terms);
    const trText = fold(text);

    if (trTerm === trText) {
        return 0;
    }

    const termTokens = tokenizeTerm(trTerm);

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


module.exports = {
    kyori: {
        similarity: fn_similarity
    }
};
