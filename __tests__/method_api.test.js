const t = require('tap');

const {
    similarityFromDistance,
    distanceFromSimilarity,
    rankByDistance,
    rankBySimilarity
} = require('../src/common/method_api.js');


t.test('common/method_api/similarityFromDistance', (t) => {
    t.equal(similarityFromDistance(1, 'foo', 'food'), 0.75);
    t.equal(similarityFromDistance(0, 'foo', 'foo'), 1);
    // two empty strings have no length to normalise against, and are identical
    t.equal(similarityFromDistance(0, '', ''), 1);
    t.equal(similarityFromDistance(0, null, undefined), 1);
    // an ineligible distance stays ineligible
    t.equal(similarityFromDistance(-1, 'foo', 'food'), -1);
    t.end();
});


t.test('common/method_api/distanceFromSimilarity', (t) => {
    t.equal(distanceFromSimilarity(1), 0);
    t.equal(distanceFromSimilarity(0.25), 0.75);
    // guards for metrics that report ineligibility instead of a score
    t.equal(distanceFromSimilarity(-1), -1);
    t.equal(distanceFromSimilarity(null), -1);
    t.equal(distanceFromSimilarity('nope'), -1);
    t.end();
});


t.test('common/method_api/rankByDistance', (t) => {
    const distance = (q, c) => (c === 'skip' ? -1 : Math.abs(c.length - q.length));

    t.strictSame(rankByDistance(distance, 'ab', ['abcd', 'abc', 'ab']), [
        { term: 'ab', score: 0 },
        { term: 'abc', score: 1 },
        { term: 'abcd', score: 2 }
    ]);

    // ineligible candidates keep their -1 but sort last
    t.strictSame(rankByDistance(distance, 'ab', ['skip', 'ab']), [
        { term: 'ab', score: 0 },
        { term: 'skip', score: -1 }
    ]);

    // ties break lexicographically
    t.strictSame(rankByDistance(() => 0, 'q', ['beta', 'alpha']), [
        { term: 'alpha', score: 0 },
        { term: 'beta', score: 0 }
    ]);

    t.strictSame(rankByDistance(distance, 'ab', null), []);
    t.end();
});


t.test('common/method_api/rankBySimilarity', (t) => {
    const similarity = (q, c) => (c === 'skip' ? -1 : (c === q ? 1 : 0.5));

    // higher similarity first
    t.strictSame(rankBySimilarity(similarity, 'ab', ['zz', 'ab']), [
        { term: 'ab', score: 1 },
        { term: 'zz', score: 0.5 }
    ]);

    t.strictSame(rankBySimilarity(similarity, 'ab', ['skip', 'zz']), [
        { term: 'zz', score: 0.5 },
        { term: 'skip', score: -1 }
    ]);

    // ties break lexicographically
    t.strictSame(rankBySimilarity(() => 0.5, 'q', ['beta', 'alpha']), [
        { term: 'alpha', score: 0.5 },
        { term: 'beta', score: 0.5 }
    ]);

    t.strictSame(rankBySimilarity(similarity, 'ab', undefined), []);
    t.end();
});
