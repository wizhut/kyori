const t = require('tap');


const { damerau_levensthein } = require('../src/methods/damerau_levensthein.js');


t.test('kyori/damerau_levensthein/tests', (t) => {
    t.equal(damerau_levensthein.distance('foo', 'foo'), 0);
    t.equal(damerau_levensthein.distance('foo', 'foody'), 2);
    t.end();
});
