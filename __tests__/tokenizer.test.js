const t = require('tap');

const { tokenizeTerm } = require('../src/common/tokenize.js');


t.test('common/tokenizer', (t) => {
    t.has(tokenizeTerm('foo'), ['foo']);
    t.has(tokenizeTerm('bar   '), ['bar']);
    t.has(tokenizeTerm('    bar'), ['bar']);
    t.has(tokenizeTerm('foo  baz'), ['foo', 'baz']);
    t.has(tokenizeTerm('  foo  '), ['foo']);
    t.has(tokenizeTerm(''), []);
    t.has(tokenizeTerm(null), []);
    t.has(tokenizeTerm(undefined), []);
    t.has(tokenizeTerm('foo   baz fii'), ['foo', 'baz', 'fii']);
    t.has(tokenizeTerm('foo\tbar'), ['foo', 'bar']);
    t.has(tokenizeTerm('   '), []);
    t.has(tokenizeTerm('foo-bar'), ['foo', 'bar']);
    t.has(tokenizeTerm('covid-19'), ['covid', '19']);
    t.end();
});