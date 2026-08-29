const t = require('tap');

const { hamming } = require('../src/methods/edit_distance/hamming.js');


t.test('kyori/hamming/tests', (t) => {
    t.equal(hamming.distance('foo', 'foo'), 0);
    t.equal(hamming.distance('foo', 'fob'), 1);
    t.equal(hamming.distance('foo', 'food'), -1);
    // nil input on either side returns -1
    t.equal(hamming.distance(null, 'foo'), -1);
    t.equal(hamming.distance('foo', null), -1);
    t.end();
});


t.test('kyori/hamming/similarity and rank', (t) => {
    t.equal(hamming.similarity('foo', 'foo'), 1);
    t.equal(hamming.similarity('foo', 'fob'), 1 - 1 / 3);
    t.equal(hamming.similarity('foo', 'food'), -1);

    const ranked = hamming.rank('foo', ['fob', 'foo', 'food']);

    t.equal(ranked[0].term, 'foo');
    t.equal(ranked[1].term, 'fob');
    t.equal(ranked[2].term, 'food');
    t.equal(ranked[2].score, -1);
    t.end();
});
