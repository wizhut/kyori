const t = require('tap');

const kyoriDistance = require('../src/index.js');


t.test('kyoriDistance tests', (t) => {  
    t.equal(kyoriDistance('foo', 'foo'), 0);
    t.end();
});
