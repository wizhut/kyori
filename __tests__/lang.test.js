const t = require('tap');

const { isNil } = require('../src/libs/lang.js');


t.test('libs/lang/isNil', (t) => {
    t.equal(isNil('foo'), false);
    t.equal(isNil(undefined), true);
    t.equal(isNil(null), true);
    t.equal(isNil({}), false);
    t.equal(isNil([]), false);
    t.equal(isNil(123), false);
    t.end();
});
