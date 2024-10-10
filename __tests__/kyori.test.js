const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/similarity() tests', (t) => {
    t.equal(kyori.similarity('foo', 'foo'), 0);
    //t.equal(kyori.keyword_distance('foo', 'bar'), 3);
    t.end();
});

