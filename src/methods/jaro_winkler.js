const {
    similarity,
    distance
} = require('talisman/metrics/jaro-winkler');


module.exports = {
    jaro_winkler: {
        distance: distance,
        similarity: similarity
    }
}
