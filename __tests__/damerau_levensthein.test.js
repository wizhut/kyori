const t = require('tap');

const { damerau_levensthein } = require('../src/methods/edit_distance/damerau_levensthein.js');


t.test('kyori/damerau_levensthein/distance', (t) => {
    const tests = [
        ['', '', 0],
        ['yo', '', 2],
        ['', 'yo', 2],
        ['foo', 'foo', 0],
        ['foo', 'food', 1],
        ['foo', 'foodo', 2],
        ['foo', 'foody', 2],
        ['kitten', 'sitting', 3],
        // adjacent transposition is a single edit (Levenshtein would score 2)
        ['ab', 'ba', 1],
        ['ca', 'ac', 1],
        ['foobar', 'foboar', 1]
    ];

    for (let test of tests) {
        t.equal(damerau_levensthein.distance(test[0], test[1]), test[2]);
    }

    t.end();
});


t.test('kyori/damerau_levensthein/distance/null-test', (t) => {
    t.equal(damerau_levensthein.distance(null, null), -1);
    t.equal(damerau_levensthein.distance(null, '1'), -1);
    t.equal(damerau_levensthein.distance(undefined, '1'), -1);
    t.equal(damerau_levensthein.distance('1', null), -1);
    t.equal(damerau_levensthein.distance('1', undefined), -1);
    t.equal(damerau_levensthein.distance(undefined, undefined), -1);
    t.end();
});


t.test('kyori/damerau_levensthein/similarity and rank', (t) => {
    t.equal(damerau_levensthein.similarity('ab', 'ba'), 0.5);
    t.equal(damerau_levensthein.similarity('foo', 'foo'), 1);

    const ranked = damerau_levensthein.rank('ab', ['ba', 'ab', 'zz']);

    t.equal(ranked[0].term, 'ab');
    t.equal(ranked[1].term, 'ba');
    t.end();
});
