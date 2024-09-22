const t = require('tap');

const kyori = require('../src/index.js');


t.test('kyori.keyword_distance() tests', (t) => {  
    t.equal(kyori.keyowrd_distance('foo', 'foo'), 0);
    t.equal(kyori.keyowrd_distance('foo', 'bar'), 3);
    t.end();
});

t.test('kyori.equals() tests', (t) => {
    t.equal(kyori.equals('foo', 'foo'), true);
    t.equal(kyori.equals('foo', 'bar'), false);
    t.end();
});