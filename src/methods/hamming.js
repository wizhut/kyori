

function fn_hamming(term, text) {
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


module.exports = {
    hamming: {
        distance: fn_hamming
    }
};
