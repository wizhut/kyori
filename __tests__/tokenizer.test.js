const t = require('tap');

const { tokenizeTerm } = require('../src/libs/tokenize.js');


t.test('libs/tokenizer', (t) => {
    t.has(tokenizeTerm('foo'), ['foo']);
    t.has(tokenizeTerm('bar   '), ['bar']);
    t.has(tokenizeTerm('    bar'), ['bar']);
    t.has(tokenizeTerm('foo  baz'), ['foo', 'baz']);
    t.has(tokenizeTerm('  foo  '), ['foo']);
    t.has(tokenizeTerm(''), []);
    t.has(tokenizeTerm(null), []);
    t.has(tokenizeTerm(undefined), []);
    t.has(tokenizeTerm('foo   baz fii'), ['foo', 'baz', 'fii']);
    t.end();
});