/*
wrapper for https://www.npmjs.com/package/fastest-levenshtein
 */
const levensthein = require('talisman/metrics/levenshtein');

const { isNil } = require('../libs/lang.js');


function fl_distance(terms, text) {
    if (isNil(terms) || isNil(text)) {
        return -1;
    }

    return levensthein(terms, text);
}


module.exports = {
    levensthein: {
        distance: fl_distance
    }
};
