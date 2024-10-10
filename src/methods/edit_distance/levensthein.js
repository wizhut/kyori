const { allAreNotNil } = require('../../libs/lang.js');


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


module.exports = {
    levensthein: {
        distance: fl_distance
    }
};
