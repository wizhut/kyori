const { transliterate: tr } = require('transliteration');

const { tokenizeTerm } = require("../../libs/tokenize.js");


function fn_similarity(terms, text) {
    if (terms === text) {
        return 0;
    }

    const trTerm = tr(terms);
    const trText = tr(text);
    const trTermLen = trTerm.length;
    const trTextLen = trText.length;

    // tokenize
    const termTokens = tokenizeTerm(trTerm);

    // penalize with range of whole keywords
    let score = Math.abs(trTextLen - trTermLen);

    for (let i = 0; i < termTokens.length; i++) {
        const token = termTokens[i];
        const textIndex = trText.indexOf(token);

        if (textIndex === -1) {
            score += token.length;
            continue;
        }

        const termIndex = trTerm.indexOf(token)
        const indexDistance = Math.abs(textIndex - termIndex);

        score += indexDistance;
    }

    return score;
}


module.exports = {
    kyori: {
        similarity: fn_similarity
    }
}
