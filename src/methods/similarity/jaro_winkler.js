const {
    distanceFromSimilarity,
    rankBySimilarity
} = require('../../common/method_api.js');


function jaroWinkler(s1, s2) {
    if (s1.length === 0 || s2.length === 0) {
        return 0;
    }

    const jaroDistance = calculateJaro(s1, s2);
    let prefixLength = 0;

    for (let i = 0; i < Math.min(4, s1.length, s2.length); i++) {
        if (s1[i] === s2[i]) prefixLength++;
        else break;
    }

    const p = 0.1; // Standard scaling factor
    return jaroDistance + prefixLength * p * (1 - jaroDistance);
}


function calculateJaro(s1, s2) {
    const len1 = s1.length;
    const len2 = s2.length;
    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

    let matches1 = Array(len1).fill(false);
    let matches2 = Array(len2).fill(false);

    let matches = 0;
    let transpositions = 0;

    // Find matching characters
    for (let i = 0; i < len1; i++) {
        const start = Math.max(0, i - matchDistance);
        const end = Math.min(i + matchDistance + 1, len2);

        for (let j = start; j < end; j++) {
            if (!matches2[j] && s1[i] === s2[j]) {
                matches1[i] = true;
                matches2[j] = true;
                matches++;
                break;
            }
        }
    }

    // If no matches, return 0
    if (matches === 0) return 0;

    // Count transpositions
    let k = 0;
    for (let i = 0; i < len1; i++) {
        if (matches1[i]) {
            while (!matches2[k]) k++;
            if (s1[i] !== s2[k]) transpositions++;
            k++;
        }
    }

    transpositions /= 2;

    // Calculate Jaro similarity
    return (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3;
}


function jaroWinklerDistance(s1, s2) {
    return distanceFromSimilarity(jaroWinkler(s1, s2));
}


function jaroWinklerRank(query, candidates) {
    return rankBySimilarity(jaroWinkler, query, candidates);
}


module.exports = {
    jaro_winkler: {
        similarity: jaroWinkler,
        distance: jaroWinklerDistance,
        rank: jaroWinklerRank
    }
};
