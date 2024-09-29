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


t.test('kyori/levensthein/closest', (t) => {
    t.equal(levensthein.closest('fast', ['faster', 'fasting', 'fostered']), 'faster');
    t.end();
});


t.test('kyori/levensthein/closest/null-test', (t) => {
    t.equal(levensthein.closest('fast', null), null);
    t.equal(levensthein.closest('fast', undefined), null);
    t.equal(levensthein.closest(null, null), null);
    t.equal(levensthein.closest(undefined, undefined), null);
    t.equal(levensthein.closest(null, []), null);
    t.equal(levensthein.closest(null, ['test']), null);
    t.equal(levensthein.closest(undefined, []), null);
    t.equal(levensthein.closest(undefined, ['test']), null);
    t.end();
});