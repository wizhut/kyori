const t = require('tap');

const { jaro_winkler } = require('../src/methods/similarity/jaro_winkler.js');


t.test('kyori/jaro_winkler/tests', (t) => {
    t.equal(jaro_winkler.similarity('test', 'test'), 1);
    t.equal(jaro_winkler.similarity('test', 'food'), 0);
    // matching characters out of order count as transpositions
    t.equal(jaro_winkler.similarity('martha', 'marhta'), 0.9611111111111111);
    t.equal(jaro_winkler.similarity('abcd', 'abXd'), 0.8666666666666667);
    // an empty string on either side scores 0
    t.equal(jaro_winkler.similarity('', 'test'), 0);
    t.equal(jaro_winkler.similarity('test', ''), 0);
    t.end();
});


t.test('kyori/jaro_winkler/distance and rank', (t) => {
    t.equal(jaro_winkler.distance('test', 'test'), 0);
    t.equal(jaro_winkler.distance('test', 'food'), 1);

    const ranked = jaro_winkler.rank('martha', ['marhta', 'food', 'martha']);

    t.equal(ranked[0].term, 'martha');
    t.equal(ranked[1].term, 'marhta');
    t.equal(ranked[2].term, 'food');
    t.end();
});
