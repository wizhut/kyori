const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/distance() tests', (t) => {
    t.equal(kyori.distance('foo', 'foo'), 0);
    // typed-prefix path: exact window match → 0 (unread 'd' not penalized)
    t.equal(kyori.distance('foo', 'food'), 0);
    // infix / different first char → full length + token path
    t.equal(kyori.distance('foo', 'ofoo'), 5);
    t.equal(kyori.distance('foo bar', 'foo'), 7);
    t.equal(kyori.distance('café', 'cafe'), 0);
    t.equal(kyori.distance('naïve', 'naive'), 0);
    t.end();
});


t.test('kyori/distance() case and whitespace', (t) => {
    t.equal(kyori.distance('Foo', 'foo'), 0);
    t.equal(kyori.distance('CAFÉ', 'cafe'), 0);
    t.equal(kyori.distance('New York', 'new york'), 0);
    t.equal(kyori.distance('foo\tbar', 'foo bar'), 0);
    t.equal(kyori.distance('foo', 'Foo Bar'), 0);
    t.end();
});


t.test('kyori/distance() hyphens', (t) => {
    t.equal(kyori.distance('foo-bar', 'foo bar'), 0);
    t.equal(kyori.distance('foo bar', 'foo-bar'), 0);
    t.equal(kyori.distance('covid-19', 'covid 19'), 0);
    t.equal(kyori.distance('foo–bar', 'foo bar'), 0);
    t.end();
});


t.test('kyori/distance() prefix beats infix', (t) => {
    t.equal(kyori.distance('art', 'artist'), 0);
    t.equal(kyori.distance('art', 'cart'), 5);
    t.ok(kyori.distance('art', 'artist') < kyori.distance('art', 'cart'));
    t.ok(kyori.distance('foo', 'food') < kyori.distance('foo', 'ofoo'));
    t.end();
});


t.test('kyori/distance() typed-prefix window', (t) => {
    t.equal(kyori.distance('chore li', 'chore list for wall'), 0);
    // one mistyped character in the typed span; unread suffix free
    t.equal(kyori.distance('chore lo', 'chore list for wall'), 1);
    t.equal(kyori.distance('picture frames with ', 'picture frames with design'), 0);
    // far window (not a near typed-prefix) → does not short-circuit to a tiny score
    t.ok(kyori.distance('tikka', 'Tomato Soup') > kyori.distance('chore lo', 'chore list for wall'));
    t.end();
});


t.test('kyori/distance() misplaced keywords', (t) => {
    // same tokens, different order → flat penalty 1 (not positional)
    t.equal(kyori.distance('hotel bel-air', 'bel-air hotel'), 1);
    t.equal(kyori.distance('bel-air hotel', 'hotel bel-air'), 1);
    t.equal(kyori.distance('foo bar', 'bar foo'), 1);
    // not a whole-keyword match (and not an exact typed prefix of the other)
    t.ok(kyori.distance('bar foo', 'foo bar baz') > 1);
    t.ok(kyori.distance('foo bar baz', 'bar foo') > 1);
    t.end();
});


t.test('kyori/distance() typos', (t) => {
    // same first char + longer candidate → typed-prefix window only
    t.equal(kyori.distance('fod', 'food'), 1);
    t.equal(kyori.distance('fod', 'bar'), 3);
    t.ok(kyori.distance('fod', 'food') < kyori.distance('fod', 'bar'));
    t.equal(kyori.distance('ofo', 'foo'), 1);
    t.end();
});


t.test('kyori/distance() nil-test', (t) => {
    t.equal(kyori.distance(null, null), 0);
    t.equal(kyori.distance(null, 'foo'), 3);
    t.equal(kyori.distance('foo', null), 6);
    t.equal(kyori.distance(undefined, 'foo'), 3);
    t.end();
});


t.test('kyori/similarity() token Jaccard resemblance', (t) => {
    // higher is better — pairwise resemblance, not ranking cost
    t.equal(kyori.similarity('foo', 'foo'), 1);
    t.equal(kyori.similarity('hotel bel-air', 'bel-air hotel'), 1);
    t.equal(kyori.similarity('foo bar', 'bar foo'), 1);
    t.equal(kyori.similarity('foo', 'food'), 0);
    t.equal(kyori.similarity('foo', 'Foo Bar'), 0.5);
    t.equal(kyori.similarity('café', 'cafe'), 1);
    t.equal(kyori.similarity(null, null), 1);
    t.equal(kyori.similarity(null, 'foo'), 0);
    t.end();
});


t.test('kyori/rank() orders by distance', (t) => {
    const ranked = kyori.rank('art', ['cart', 'artist', 'art']);

    t.equal(ranked[0].term, 'art');
    t.equal(ranked[0].score, 0);
    t.equal(ranked[1].term, 'artist');
    t.equal(ranked[1].score, 0);
    t.equal(ranked[2].term, 'cart');
    t.equal(ranked[2].score, 5);
    t.end();
});
