const damerauLevensthein = require('talisman/metrics/damerau-levenshtein');

module.exports = {
    damerau_levensthein: {
        distance: damerauLevensthein
    }
};
