const t = require('tap');

const { allAreNotNil } = require('../src/common/lang.js');


t.test('common/lang/allAreNotNil', (t) => {
    t.equal(allAreNotNil(['foo']), true);
    t.equal(allAreNotNil(['foo', null]), false);
    t.equal(allAreNotNil([undefined, 'foo']), false);
    t.equal(allAreNotNil([]), false);
    t.end();
});