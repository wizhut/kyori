const t = require('tap');

const { isNil, allAreNotNil } = require('../src/libs/lang.js');


t.test('libs/lang/isNil', (t) => {
    t.equal(isNil('foo'), false);
    t.equal(isNil(undefined), true);
    t.equal(isNil(null), true);
    t.equal(isNil({}), false);
    t.equal(isNil([]), false);
    t.equal(isNil(123), false);
    t.end();
});

t.test('libs/lang/allAreNotNil', (t) => {
    t.equal(allAreNotNil(['foo']), true);
    t.equal(allAreNotNil(['foo', null]), false);
    t.equal(allAreNotNil([undefined, 'foo']), false);
    t.equal(allAreNotNil([]), false);
    t.end();
});