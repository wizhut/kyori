const t = require('tap');

const { jaro_winkler } = require('../src/methods/edit_distance/jaro_winkler.js');


t.test('kyori/jaro_winkler/tests', (t) => {
    t.equal(jaro_winkler.distance('test', 'test'), 1);
    t.equal(jaro_winkler.distance('test', 'food'), 0);
    t.end();
});
