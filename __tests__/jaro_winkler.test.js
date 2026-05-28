const t = require('tap');

const { jaro_winkler } = require('../src/methods/similarity/jaro_winkler.js');


t.test('kyori/jaro_winkler/tests', (t) => {
    t.equal(jaro_winkler.similarity('test', 'test'), 1);
    t.equal(jaro_winkler.similarity('test', 'food'), 0);
    // an empty string on either side scores 0
    t.equal(jaro_winkler.similarity('', 'test'), 0);
    t.equal(jaro_winkler.similarity('test', ''), 0);
    t.end();
});
