const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/similarity() tests', (t) => {
    t.equal(kyori.similarity('foo', 'foo'), 0);
    t.equal(kyori.similarity('foo', 'food'), 1);
    t.equal(kyori.similarity('foo', 'ofoo'), 2);
    // a query token absent from the text adds its full length to the score
    // 'foo bar' vs 'foo': |3-7| length gap + 0 (foo aligned) + 3 (bar absent) = 7
    t.equal(kyori.similarity('foo bar', 'foo'), 7);
    t.end();
});

