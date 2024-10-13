const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/similarity() tests', (t) => {
    t.equal(kyori.similarity('foo', 'foo'), 0);
    t.equal(kyori.similarity('foo', 'food'), 1);

    t.end();
});

