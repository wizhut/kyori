const { transliterate: tr } = require('transliteration');

const { tokenize_term } = require("../../libs/tokenize.js");


function fn_similarity(terms, text) {
    if (terms === text) {
        return 0;
    }

    const trTerm = tr(terms);
    const trText = tr(text);
    const trTermLen = trTerm.length;
    const trTextLen = trText.length;

    // tokenize
    const termTokens = tokenize_term(terms);

    // penalize with range
    let score = Math.abs(trTextLen - trTermLen);

    for (let i = 0; i < termTokens.length; i++) {
        const token = termTokens[i];


    }

    return score;
}


module.exports = {
    kyori: {
        similarity: fn_similarity
    }
}
