const t = require('tap');

const { levensthein } = require('../src/index.js');


t.test('kyori/levensthein/distance', (t) => {
    const tests = [
        ['', '', 0],
        ['yo', '', 2],
        ['', 'yo', 2],
        ['yo', 'yo', 0],
        ['tier', 'tor', 2],
        ['saturday', 'sunday', 3],
        ['mist', 'dist', 1],
        ['tier', 'tor', 2],
        ['kitten', 'sitting', 3],
        ['stop', 'tops', 2],
        ['rosettacode', 'raisethysword', 8],
        ['mississippi', 'swiss miss', 8],
        ['fast', 'fist', 1],
        ['fast', 'fast', 0],
        ['uninformed', 'uniformed', 1],
        ['kitten', 'sitting', 3]
    ];

    for (let test of tests) {
        t.equal(levensthein.distance(test[0], test[1]), test[2]);
    }

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
