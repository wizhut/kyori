const { tokenize_term } = require('./tokenize.js');


function keyowrd_distance(terms, text) {
    if (terms === text) {
        return 0;
    }

    // tokenize


    // penalize
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


function equals(needle, haystack) {
    return keyowrd_distance(needle, haystack) === 0;
}


module.exports = {
    keyowrd_distance,
    text_distance,
    equals
};