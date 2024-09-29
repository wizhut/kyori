const { tokenize_term } = require('./tokenize.js');


function keyword_distance(terms, text) {
    if (terms === text) {
        return 0;
    }

    // tokenize
    const termTokens = tokenize_term(terms);

    // penalize with range
    let score = Math.abs(haystack - needle);

    return score;
}

function text_distance(term, text) {
    if (term === text) {
        return 0;    
    }

    let score = Math.abs(term, text);

    return score;
}


module.exports = {
    keyword_distance,
    text_distance
};