const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');
const { KyoriIndex } = require('../src/indices/kyori.js');
const { prepare } = require('../src/methods/similarity/kyori_core.js');
const { tokenizeTerm } = require('../src/common/tokenize.js');

// 0.6.0 folds each string once per call instead of once per pair. These are
// the values 0.5.1 gave, computed with that version and written down here:
// the worked examples of the research tree's algorithm.md (section 2),
// non-ASCII input (ligatures, eszett, stroked o, diacritics, en and em
// dashes, a non-Latin script) and null / undefined. A later version that
// changes any of them has changed the method, not its speed.
const PAIRS = [
    // [query, candidate, distance, similarity, rankKey]
    ['foo', 'food', 0, 0, 0.8],
    ['fod', 'food', 1, 0, 1.8],
    ['chore lo', 'chore list for wall', 1, 0.2, 1.95],
    ['dishwaher', 'dishwasher pods', 1, 0, 1.9375],
    ['food', 'foo', 1, 0, 1.75],
    // transpositions inside the typed prefix: one OSA edit
    ['teh', 'the', 1, 0, 1.75],
    ['fodo', 'food', 1, 0, 1.8],
    ['dishwahser', 'dishwasher pods', 1, 0, 1.9375],
    ['recieve', 'receive mail', 1, 0, 1.9230769230769231],
    ['ab', 'ax pens', 6, 0, 6.875],
    ['hotel bel-air', 'bel-air hotel', 1, 1, 1.9285714285714286],
    ['art', 'cart', 5, 0, 5.8],
    ['foo', 'ofoo', 5, 0, 5.8],
    ['foo bar', 'foo', 7, 0.5, 7.75],
    ['pizza', 'margherita pizza', 22, 0.5, 22.941176470588236],
    [null, 'foo', 3, 0, 3.75],
    ['Æsir', 'aesir', 0, 1, 0.8333333333333334],
    ['Straße', 'strasse', 0, 1, 0.875],
    ['øl', 'ol', 0, 1, 0.6666666666666666],
    ['Łódź', 'lodz', 0, 1, 0.8],
    ['naïve', 'naive', 0, 1, 0.8333333333333334],
    ['foo–bar', 'foo bar', 0, 1, 0.875],
    ['foo—bar', 'foo-bar', 0, 1, 0.875],
    ['München', 'munchen', 0, 1, 0.875],
    ['Œuf', 'oeuf', 0, 1, 0.8],
    ['smørrebrød', 'smorrebrod', 0, 1, 0.9090909090909091],
    ['straße', 'str', 8, 0, 8.75],
    ['bel–air', 'bel—air hotel', 0, 0.6666666666666666, 0.9285714285714286],
    ['距離 sushi', 'sushi', 8, 0.5, 8.833333333333334],
    [undefined, undefined, 0, 1, 0],
    [null, null, 0, 1, 0],
    [undefined, 'foo', 3, 0, 3.75],
    ['foo', null, 6, 0, 6],
    ['', '', 0, 1, 0],
    ['', 'a', 1, 0, 1.5],
    [null, 'café', 4, 0, 4.8],
    ['ß', 'ss', 0, 1, 0.6666666666666666]
];


t.test('kyori/0.6.0 gives 0.5.1 values: distance, similarity, rankKey', (t) => {
    for (const [q, c, distance, similarity, rankKey] of PAIRS) {
        const label = `${JSON.stringify(q)} → ${JSON.stringify(c)}`;

        t.equal(kyori.distance(q, c), distance, `distance ${label}`);
        t.equal(kyori.similarity(q, c), similarity, `similarity ${label}`);
        t.equal(kyori.rankKey(q, c), rankKey, `rankKey ${label}`);
    }

    t.end();
});


t.test('kyori/0.6.0 gives 0.5.1 orders: rank() and KyoriIndex', (t) => {
    const pools = [
        ['caf', ['café', 'cafe', 'Çafé au lait', 'kaffe', 'CAFÉ–BAR', 'cafétéria'],
            ['cafe', 'café', 'CAFÉ–BAR', 'cafétéria', 'Çafé au lait', 'kaffe'], [0, 0, 0, 0, 0, 5]],
        ['straß', ['Straße', 'strasse', 'strass', 'Strässchen', 'ß', 'st'],
            ['strass', 'strasse', 'Straße', 'Strässchen', 'ß', 'st'], [0, 0, 0, 0, 8, 8]],
        ['hotel bel-air', ['bel-air hotel', 'hotel bel–air', 'Hotel Bel Air', 'bel air', 'hotel', null, undefined, 'motel bel-air'],
            ['Hotel Bel Air', 'hotel bel–air', 'bel-air hotel', 'motel bel-air', 'hotel', 'bel air', null, undefined], [0, 0, 1, 1, 14, 21, 24, 24]],
        [null, ['foo', '', null], ['', null, 'foo'], [0, 0, 3]]
    ];

    for (const [q, pool, terms, scores] of pools) {
        const ranked = kyori.rank(q, pool);

        t.strictSame(ranked.map((r) => r.term), terms, `rank(${JSON.stringify(q)}) order`);
        t.strictSame(ranked.map((r) => r.score), scores, `rank(${JSON.stringify(q)}) scores`);

        const index = new KyoriIndex();

        index.addMany(pool);
        t.strictSame(index.search(q), ranked, `KyoriIndex.search(${JSON.stringify(q)})`);
    }

    t.strictSame(kyori.rank('foo', null), []);
    t.end();
});


t.test('kyori/prepared tokens are tokenizeTerm() of the fold', (t) => {
    const inputs = ['foo', '  foo  bar ', 'foo-bar', 'foo–bar—baz', 'covid-19', 'a b', '--', '-', '', null, undefined,
        'Straße – Łódź', 'hotel bel-air', '距離 sushi', 'a \t b\n-c', 123];

    for (const input of inputs) {
        const { text, tokens } = prepare(input);

        t.strictSame(tokens, tokenizeTerm(text), `tokens of ${JSON.stringify(input)}`);
    }

    t.end();
});
