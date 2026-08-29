// Shared helpers so every method exposes distance, similarity, and rank.


function similarityFromDistance(distance, left, right) {
    if (distance < 0) {
        return -1;
    }

    const maxLen = Math.max(String(left == null ? '' : left).length, String(right == null ? '' : right).length);

    if (maxLen === 0) {
        return 1;
    }

    return 1 - (distance / maxLen);
}


function distanceFromSimilarity(similarity) {
    if (typeof similarity !== 'number' || similarity < 0) {
        return -1;
    }

    return 1 - similarity;
}


function rankByDistance(distanceFn, query, candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    const scored = [];

    for (let i = 0; i < list.length; i++) {
        const term = list[i];
        const score = distanceFn(query, term);
        const ineligible = typeof score !== 'number' || score < 0;

        scored.push({
            term,
            score,
            sortKey: ineligible ? Number.POSITIVE_INFINITY : score
        });
    }

    scored.sort((a, b) => a.sortKey - b.sortKey || String(a.term).localeCompare(String(b.term)));

    return scored.map((row) => ({ term: row.term, score: row.score }));
}


function rankBySimilarity(similarityFn, query, candidates) {
    const list = Array.isArray(candidates) ? candidates : [];
    const scored = [];

    for (let i = 0; i < list.length; i++) {
        const term = list[i];
        const score = similarityFn(query, term);
        const ineligible = typeof score !== 'number' || score < 0;

        scored.push({
            term,
            score,
            sortKey: ineligible ? Number.POSITIVE_INFINITY : -score
        });
    }

    scored.sort((a, b) => a.sortKey - b.sortKey || String(a.term).localeCompare(String(b.term)));

    return scored.map((row) => ({ term: row.term, score: row.score }));
}


module.exports = {
    similarityFromDistance,
    distanceFromSimilarity,
    rankByDistance,
    rankBySimilarity
};
