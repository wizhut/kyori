const t = require('tap');

const {levensthein} = require('../src/index.js');


t.test('kyori/levensthein/distance', (t) => {
    t.equal(levensthein.distance('fast', 'fist'), 1);
    t.equal(levensthein.distance('fast', 'fast'), 0);
    t.end();
});


t.test('kyori/levensthein/distance/null-test', (t) => {
    t.equal(levensthein.distance(null, null), -1);
    t.equal(levensthein.distance(null, '1'), -1);
    t.equal(levensthein.distance(undefined, '1'), -1);
    t.equal(levensthein.distance('1', null), -1);
    t.equal(levensthein.distance('1', undefined), -1);
    t.equal(levensthein.distance(undefined, undefined), -1);
    t.end();
});
