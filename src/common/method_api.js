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


/**
 * Order candidates by a key, lowest first. `scoreFn(term, index)` returns
 * `{ score, key }`: the score reported in the result and the key the sort
 * uses. Ineligible scores (non-numbers, negatives) sort last; remaining ties
 * are broken lexicographically.
 */
function rankByKey(candidates, scoreFn) {
    const list = Array.isArray(candidates) ? candidates : [];
    const scored = [];

    for (let i = 0; i < list.length; i++) {
        const term = list[i];
        const { score, key } = scoreFn(term, i);
        const ineligible = typeof score !== 'number' || score < 0;

        scored.push({
            term,
            score,
            sortKey: ineligible ? Number.POSITIVE_INFINITY : key
        });
    }

    scored.sort((a, b) => a.sortKey - b.sortKey || String(a.term).localeCompare(String(b.term)));

    return scored.map((row) => ({ term: row.term, score: row.score }));
}


/**
 * Order candidates by a distance function, lowest first. `keyFn(query, term,
 * distance)` may refine the sort key -- a method's own tie-breaker -- provided it
 * keeps the distance order; `score` in the result is always the distance.
 * Ineligible scores (non-numbers, negatives) sort last; remaining ties are
 * broken lexicographically.
 */
function rankByDistance(distanceFn, query, candidates, keyFn) {
    return rankByKey(candidates, (term) => {
        const score = distanceFn(query, term);
        const ineligible = typeof score !== 'number' || score < 0;

        return {
            score,
            key: ineligible ? Number.POSITIVE_INFINITY : (keyFn ? keyFn(query, term, score) : score)
        };
    });
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
    rankByKey,
    rankByDistance,
    rankBySimilarity
};
