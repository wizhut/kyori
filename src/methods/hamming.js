const hamming = require('talisman/metrics/hamming.js');


function fn_hamming(term, text) {
    try {
        return hamming(term, text);
    } catch(e) {
        return -1;
    }
}


module.exports = {
    hamming: {
        distance: fn_hamming
    }
};
