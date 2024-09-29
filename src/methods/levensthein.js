/*
wrapper for https://www.npmjs.com/package/fastest-levenshtein
 */
const { distance, closest } = require('fastest-levenshtein')


function fl_distance(terms, text) {
    return distance(terms, text);
}

function fl_closest() {

}


module.exports = {
    levensthein: {
        distance: fl_distance,
        closest: fl_closest
    }
};