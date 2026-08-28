const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/similarity() tests', (t) => {
    t.equal(kyori.similarity('foo', 'foo'), 0);
    t.equal(kyori.similarity('foo', 'food'), 1);
    // infix match: length gap 1 + position 1 + token-length penalty 3 = 5
    t.equal(kyori.similarity('foo', 'ofoo'), 5);
    // a query token absent from the text adds min(token length, damerau to a text token)
    // 'foo bar' vs 'foo': |3-7| length gap + 0 (foo aligned) + 3 (bar vs foo) = 7
    t.equal(kyori.similarity('foo bar', 'foo'), 7);
    // Latin diacritics fold to ASCII before scoring
    t.equal(kyori.similarity('café', 'cafe'), 0);
    t.equal(kyori.similarity('naïve', 'naive'), 0);
    t.end();
});


t.test('kyori/similarity() case and whitespace', (t) => {
    t.equal(kyori.similarity('Foo', 'foo'), 0);
    t.equal(kyori.similarity('CAFÉ', 'cafe'), 0);
    t.equal(kyori.similarity('New York', 'new york'), 0);
    t.equal(kyori.similarity('foo\tbar', 'foo bar'), 0);
    t.equal(kyori.similarity('foo', 'Foo Bar'), 4);
    t.end();
});


t.test('kyori/similarity() hyphens', (t) => {
    t.equal(kyori.similarity('foo-bar', 'foo bar'), 0);
    t.equal(kyori.similarity('foo bar', 'foo-bar'), 0);
    t.equal(kyori.similarity('covid-19', 'covid 19'), 0);
    t.equal(kyori.similarity('foo–bar', 'foo bar'), 0);
    t.end();
});


t.test('kyori/similarity() prefix beats infix', (t) => {
    t.equal(kyori.similarity('art', 'artist'), 3);
    t.equal(kyori.similarity('art', 'cart'), 5);
    t.ok(kyori.similarity('art', 'artist') < kyori.similarity('art', 'cart'));
    t.ok(kyori.similarity('foo', 'food') < kyori.similarity('foo', 'ofoo'));
    t.end();
});


t.test('kyori/similarity() typos', (t) => {
    t.equal(kyori.similarity('fod', 'food'), 2);
    t.equal(kyori.similarity('fod', 'bar'), 3);
    t.ok(kyori.similarity('fod', 'food') < kyori.similarity('fod', 'bar'));
    t.equal(kyori.similarity('ofo', 'foo'), 1);
    t.end();
});


t.test('kyori/similarity() nil-test', (t) => {
    t.equal(kyori.similarity(null, null), 0);
    t.equal(kyori.similarity(null, 'foo'), 3);
    t.equal(kyori.similarity('foo', null), 6);
    t.equal(kyori.similarity(undefined, 'foo'), 3);
    t.end();
});
