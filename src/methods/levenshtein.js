/*
wrapper for https://www.npmjs.com/package/fastest-levenshtein
 */
const { distance, closest } = require('fastest-levenshtein')


function fl_distance() {

}

function fl_closest() {

}


module.exports = {
    levenshtein: {
        distance: fl_distance,
        closest: fl_closest
    }
};