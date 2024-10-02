const t = require('tap');

const { hamming } = require('../src/methods/hamming.js');


t.test('methods/hamming', (t) => {
    t.equal(hamming.distance('foo', 'foo'), 0);
    t.equal(hamming.distance('foo', 'fob'), 1);
    t.equal(hamming.distance('foo', 'food'), -1);
    t.end();
});
