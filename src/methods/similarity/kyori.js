const { prepare, distancePrepared, similarityPrepared, lengthTieBreak, rankKeyPrepared } = require('./kyori_core.js');
const { rankByKey } = require('../../common/method_api.js');


/**
 * Cognitive / autocomplete cost. Lower is better (0 = best match).
 * rank() orders by this cost, then by length (shorter first); rankKey() is
 * that order as one number.
 */
function fn_distance(terms, text) {
    if (terms === text) {
        return 0;
    }

    return distancePrepared(prepare(terms), prepare(text));
}


/**
 * Token-set Jaccard resemblance after fold. Higher is better (1 = identical bags).
 * Measures pairwise similarity, not autocomplete ranking cost.
 */
function fn_similarity(terms, text) {
    return similarityPrepared(prepare(terms), prepare(text));
}


/**
 * The key rank() sorts by, as one number: distance, then length (shorter
 * first). Use it to order candidates yourself with a single score per pair.
 */
function fn_rank_key(terms, text) {
    return rankKeyPrepared(prepare(terms), prepare(text));
}


/**
 * Order candidates by distance, then length (shorter first), then the
 * alphabet. The query is folded once per call and each candidate once.
 */
function fn_rank(query, candidates) {
    const term = prepare(query);

    return rankByKey(candidates, (candidate) => {
        const text = prepare(candidate);
        const score = distancePrepared(term, text);

        return { score, key: score + lengthTieBreak(text.text.length) };
    });
}


module.exports = {
    kyori: {
        distance: fn_distance,
        similarity: fn_similarity,
        rank: fn_rank,
        rankKey: fn_rank_key
    }
};
