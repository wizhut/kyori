const { tokenize_term } = require("../libs/tokenize.js");


function keyword_distance(terms, text) {
    if (terms === text) {
        return 0;
    }

    // tokenize
    const termTokens = tokenize_term(terms);

    // penalize with range
    let score = Math.abs(text - terms);

    return score;
}

function text_distance(term, text) {
    if (term === text) {
        return 0;
    }

    let score = Math.abs(text.length - term.length);

    return score;
}


module.exports = {
    kyori: {
        keyword_distance: keyword_distance,
        text_distance: text_distance
    }
}