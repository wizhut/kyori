const {
    similarity,
    distance
} = require('talisman/metrics/jaro_winkler');


module.exports = {
    jaro_winkler: {
        distance: distance,
        similarity: similarity
    }
}