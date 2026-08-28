const { allAreNotNil } = require('../../common/lang.js');


function fl_distance(terms, text) {
    if (!allAreNotNil([terms, text])) {
        return -1;
    }

    const m = terms.length;
    const n = text.length;

    if (m === 0) {
        return n;
    }

    if (n === 0) {
        return m;
    }

    let prev2 = [];
    let prev = [];

    for (let j = 0; j <= n; j++) {
        prev[j] = j;
    }

    let curr;

    for (let i = 1; i <= m; i++) {
        curr = [i];

        for (let j = 1; j <= n; j++) {
            const cost = terms[i - 1] === text[j - 1] ? 0 : 1;

            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + cost
            );

            if (i > 1 && j > 1 &&
                terms[i - 1] === text[j - 2] &&
                terms[i - 2] === text[j - 1]) {
                curr[j] = Math.min(curr[j], prev2[j - 2] + 1);
            }
        }

        prev2 = prev;
        prev = curr;
    }

    return curr[n];
}


module.exports = {
    damerau_levensthein: {
        distance: fl_distance
    }
};
