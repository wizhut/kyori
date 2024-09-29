/*
wrapper for https://www.npmjs.com/package/fastest-levenshtein
 */
const { distance, closest } = require('fastest-levenshtein')
const { isNil } = require('../libs/lang.js');


function fl_distance(terms, text) {
    if (isNil(terms) || isNil(text)) {
        return -1;
    }

    return distance(terms, text);
}

function fl_closest(terms, arrayOfText) {
    if (isNil(terms) || isNil(arrayOfText)) {
        return null;
    }

    return closest(terms, arrayOfText);
}


module.exports = {
    levensthein: {
        distance: fl_distance,
        closest: fl_closest
    }
};