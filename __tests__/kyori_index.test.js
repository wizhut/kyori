const t = require('tap');

const { AbstractIndex } = require('../src/indices/abstract_index.js');
const { KyoriIndex } = require('../src/indices/kyori.js');


t.test('indices/AbstractIndex search is a stub', (t) => {
    const index = new AbstractIndex();

    t.has(index.search('foo'), []);
    t.end();
});


t.test('indices/KyoriIndex add and count', (t) => {
    const index = new KyoriIndex();

    t.equal(index.count(), 0);

    index.addOne('foo');
    t.equal(index.count(), 1);

    index.addMany(['food', 'ofoo']);
    t.equal(index.count(), 3);

    index.addMany('solo');
    t.equal(index.count(), 4);

    t.end();
});


t.test('indices/KyoriIndex search ranks by kyori score', (t) => {
    const index = new KyoriIndex();

    t.has(index.search('foo'), []);

    index.addMany(['ofoo', 'food', 'foo', 'bar', 'afoo']);

    const ranked = index.search('foo');

    t.equal(ranked.length, 5);
    t.equal(ranked[0].term, 'foo');
    t.equal(ranked[0].score, 0);
    t.equal(ranked[1].term, 'food');
    t.equal(ranked[1].score, 1);
    t.equal(ranked[2].term, 'bar');
    t.equal(ranked[3].term, 'afoo');
    t.equal(ranked[3].score, 5);
    t.equal(ranked[4].term, 'ofoo');
    t.equal(ranked[4].score, 5);
    t.end();
});


t.test('indices/KyoriIndex search prefix before infix', (t) => {
    const index = new KyoriIndex();

    index.addMany(['cart', 'artist', 'art']);

    const ranked = index.search('art');

    t.equal(ranked[0].term, 'art');
    t.equal(ranked[1].term, 'artist');
    t.equal(ranked[2].term, 'cart');
    t.end();
});
