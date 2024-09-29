const t = require('tap');

const {kyori} = require('../src/methods/kyori.js');


t.test('kyori/keyword_distance() tests', (t) => {
    t.equal(kyori.keyword_distance('foo', 'foo'), 0);
    //t.equal(kyori.keyword_distance('foo', 'bar'), 3);
    t.end();
});

