const { allAreNotNil } = require('../../common/lang.js');
const {
    similarityFromDistance,
    rankByDistance
} = require('../../common/method_api.js');


function fn_hamming(term, text) {
    if (!allAreNotNil([term, text])) {
        return -1;
    }

    if (term.length !== text.length) {
        return -1;
    }

    let diff = 0;

    for (let i = 0; i < text.length; i++) {
        if (term[i] !== text[i]) {
            diff += 1;
        }
    }

    return diff;
}


function fn_similarity(term, text) {
    return similarityFromDistance(fn_hamming(term, text), term, text);
}


function fn_rank(query, candidates) {
    return rankByDistance(fn_hamming, query, candidates);
}


module.exports = {
    hamming: {
        distance: fn_hamming,
        similarity: fn_similarity,
        rank: fn_rank
    }
};
