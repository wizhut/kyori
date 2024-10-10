const { tokenize_term } = require("../../libs/tokenize.js");


function fn_similarity(terms, text) {
    if (terms === text) {
        return 0;
    }

    // tokenize
    const termTokens = tokenize_term(terms);

    // penalize with range
    let score = Math.abs(text - terms);

    return score;
}


module.exports = {
    kyori: {
        similarity: fn_similarity
    }
}
