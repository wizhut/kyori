const { allAreNotNil } = require('../../common/lang.js');
const {
    similarityFromDistance,
    rankByDistance
} = require('../../common/method_api.js');


function fl_distance(terms, text) {
    if (!allAreNotNil([terms, text])) {
        return -1;
    }

    let t = [], m = terms.length, n = text.length;

    if (m === 0 && n === 0) {
        return 0;
    }

    if (m === 0) {
        return n;
    }

    for (let j = 0; j <= n; j++) {
        t[j] = j;
    }

    let u;

    for (let i = 1; i <= m; i++) {
        let j = 1;

        for (u = [i]; j <= n; j++) {
            u[j] = terms[i - 1] === text[j - 1] ? t[j - 1] : Math.min(t[j - 1], t[j], u[j - 1]) + 1;
        }

        t = u;
    }

    return u[n];
}


function fl_similarity(terms, text) {
    return similarityFromDistance(fl_distance(terms, text), terms, text);
}


function fl_rank(query, candidates) {
    return rankByDistance(fl_distance, query, candidates);
}


module.exports = {
    levensthein: {
        distance: fl_distance,
        similarity: fl_similarity,
        rank: fl_rank
    }
};
