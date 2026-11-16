const t = require('tap');

const { kyori } = require('../src/methods/similarity/kyori.js');


t.test('kyori/distance() tests', (t) => {
    t.equal(kyori.distance('foo', 'foo'), 0);
    // typed-prefix path: exact window match → 0 (unread 'd' not penalized)
    t.equal(kyori.distance('foo', 'food'), 0);
    // not a typed prefix → the word path: a tier above every prefix match,
    // then the typed words the candidate lacks, then the nearest one's edits
    t.equal(kyori.distance('foo', 'ofoo'), 7);
    t.equal(kyori.distance('foo bar', 'foo'), 14);
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
    t.equal(kyori.distance('art', 'cart'), 7);
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
    t.equal(kyori.distance('fod', 'bar'), 9);
    t.ok(kyori.distance('fod', 'food') < kyori.distance('fod', 'bar'));
    // a typo in the first character is never a typed prefix; the word path
    // charges one edit to the nearest word, in the tier above
    t.equal(kyori.distance('ofo', 'foo'), 7);
    t.end();
});


t.test('kyori/distance() nil-test', (t) => {
    t.equal(kyori.distance(null, null), 0);
    // nothing typed: no word is lacking, so the word tier alone
    t.equal(kyori.distance(null, 'foo'), 1);
    // nothing to match: every typed word is lacking, at its own length
    t.equal(kyori.distance('foo', null), 9);
    t.equal(kyori.distance(undefined, 'foo'), 1);
    t.end();
});


t.test('kyori/similarity() token Jaccard resemblance', (t) => {
    // higher is better — pairwise resemblance, not ranking cost
    t.equal(kyori.similarity('foo', 'foo'), 1);
    t.equal(kyori.similarity('hotel bel-air', 'bel-air hotel'), 1);
    t.equal(kyori.similarity('foo bar', 'bar foo'), 1);
    t.equal(kyori.similarity('foo', 'Foo Bar'), 0.5);
    t.equal(kyori.similarity('café', 'cafe'), 1);
    t.equal(kyori.similarity(null, null), 1);
    t.equal(kyori.similarity(null, 'foo'), 0);
    t.end();
});


t.test('kyori/similarity() credits a word that starts a word of the other side', (t) => {
    // the share of the longer word the shorter one covers
    t.equal(kyori.similarity('foo', 'food'), 0.75 / 1.25);
    t.equal(kyori.similarity('food', 'foo'), 0.75 / 1.25);
    // a half-typed last word: chore 1 + li/list 0.5 over 2 + 4 − 1.5 words
    t.equal(kyori.similarity('chore li', 'chore list for wall'), 1.5 / 4.5);
    t.equal(kyori.similarity('chore list for wall', 'chore li'), 1.5 / 4.5);
    // only a start counts: not a word inside, not a typo
    t.equal(kyori.similarity('art', 'cart'), 0);
    t.equal(kyori.similarity('fod', 'food'), 0);
    t.equal(kyori.similarity('abc', 'abd'), 0);
    // an exact word is matched before any prefix credit
    t.equal(kyori.similarity('list li', 'list'), 0.5);
    t.end();
});


t.test('kyori/similarity() matches each word once, for the largest total, the same from either side', (t) => {
    // li could start list or lion (0.5 each): one of them, not both
    t.equal(kyori.similarity('li', 'list lion'), 0.5 / 2.5);
    t.equal(kyori.similarity('list lion', 'li'), 0.5 / 2.5);
    // abc/abcd 0.75 + a/ab 0.5 beats abc/ab 2/3 + a/abcd 0.25
    t.equal(kyori.similarity('a abc', 'ab abcd'), 1.25 / 2.75);
    t.equal(kyori.similarity('ab abcd', 'a abc'), 1.25 / 2.75);
    // b/ba alone would block both other pairs; b/bb + ba/baaa share 1
    t.equal(kyori.similarity('ba bb', 'b baaa'), 1 / 3);
    t.equal(kyori.similarity('b baaa', 'ba bb'), 1 / 3);
    // equal word counts on both sides, in both alphabetical orders
    t.equal(kyori.similarity('ab cd', 'abcd cdab'), 1 / 3);
    t.equal(kyori.similarity('xa xb', 'xaaa xbbb'), 1 / 3);
    t.equal(kyori.similarity('xaaa xbbb', 'xa xb'), 1 / 3);
    t.end();
});


t.test('kyori/similarity() properties on seeded random strings', (t) => {
    // small alphabets, so that words often start one another
    let seed = 20261116;
    const random = () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const word = (alphabet) => {
        let w = '';
        const n = 1 + Math.floor(random() * 4);

        for (let i = 0; i < n; i++) {
            w += alphabet[Math.floor(random() * alphabet.length)];
        }

        return w;
    };
    const phrase = (alphabet) => Array.from({ length: 1 + Math.floor(random() * 6) }, () => word(alphabet)).join(' ');
    const words = (s) => [...new Set(s.split(' '))];
    const credit = (x, y) => {
        const [short, long] = x.length <= y.length ? [x, y] : [y, x];

        return x !== y && long.startsWith(short) ? short.length / long.length : 0;
    };
    // the best one-to-one matching, by trying every one
    const best = (left, right) => {
        if (left.length === 0) {
            return 0;
        }

        const [head, ...rest] = left;
        let top = best(rest, right);

        right.forEach((y, j) => {
            const c = credit(head, y);

            if (c > 0) {
                top = Math.max(top, c + best(rest, right.filter((_, k) => k !== j)));
            }
        });

        return top;
    };
    let failures = 0;

    for (const alphabet of ['ab', 'abc', 'abcdef']) {
        for (let i = 0; i < 4000; i++) {
            const a = phrase(alphabet);
            const b = phrase(alphabet);
            const s = kyori.similarity(a, b);
            const A = words(a);
            const B = words(b);
            const exact = A.filter((w) => B.includes(w)).length;
            const jaccard = exact / (A.length + B.length - exact);
            const share = best(A.filter((w) => !B.includes(w)), B.filter((w) => !A.includes(w)));
            const expected = (exact + share) / (A.length + B.length - exact - share);
            const ok = s === kyori.similarity(b, a) &&
                s >= jaccard && s <= 1 &&
                (s === 1) === (jaccard === 1) &&
                Math.abs(s - expected) < 1e-12 &&
                (share > 0 || s === jaccard);

            if (!ok) {
                failures += 1;
                t.fail(`${a} / ${b}: ${s}, expected ${expected}`);
            }
        }
    }

    t.equal(failures, 0, 'symmetric, in [Jaccard, 1], 1 only for the same words, the best matching');
    t.end();
});


t.test('kyori/rank() orders by distance', (t) => {
    const ranked = kyori.rank('art', ['cart', 'artist', 'art']);

    t.equal(ranked[0].term, 'art');
    t.equal(ranked[0].score, 0);
    t.equal(ranked[1].term, 'artist');
    t.equal(ranked[1].score, 0);
    t.equal(ranked[2].term, 'cart');
    t.equal(ranked[2].score, 7);
    t.end();
});


t.test('kyori/rank() breaks distance ties by length, shorter first', (t) => {
    // every candidate is an exact typed-prefix completion → distance 0 for all
    const ranked = kyori.rank('circle', ['circle time pointer', 'circle placemats', 'circle stickets']);

    t.equal(ranked[0].term, 'circle stickets');
    t.equal(ranked[1].term, 'circle placemats');
    t.equal(ranked[2].term, 'circle time pointer');
    t.equal(ranked[0].score, 0);
    t.equal(ranked[2].score, 0);
    // equal length still ties → lexicographic
    t.equal(kyori.rank('foo', ['foob', 'fooa'])[0].term, 'fooa');
    // length is folded length: 'café' and 'cafe' tie
    t.equal(kyori.rank('caf', ['café', 'cafe'])[0].term, 'cafe');
    t.end();
});


t.test('kyori/rankKey() is distance plus a length term below 1', (t) => {
    t.equal(kyori.rankKey('foo', 'foo'), 0.75);
    t.equal(kyori.rankKey('foo', 'food'), 0.8);
    t.equal(kyori.rankKey('foo', 'ofoo'), 7.8);
    t.ok(kyori.rankKey('foo', 'foo') < kyori.rankKey('foo', 'food'));
    // a long exact completion (distance 0) still beats a short typo (distance 1)
    t.ok(kyori.rankKey('foo', 'food' + ' x'.repeat(100)) < kyori.rankKey('foo', 'fod'));
    // rankKey order agrees with rank() order
    const pool = ['cart', 'artist', 'art', 'art deco lamp'];
    const byKey = pool.slice().sort((a, b) => kyori.rankKey('art', a) - kyori.rankKey('art', b) || a.localeCompare(b));

    t.strictSame(kyori.rank('art', pool).map((r) => r.term), byKey);
    t.end();
});


t.test('kyori/distance() typed prefix uses prefix edit distance', (t) => {
    // a missed or doubled letter costs one edit against the closest prefix,
    // not two against a window of the typed length
    t.equal(kyori.distance('dishwaher', 'dishwasher pods'), 1);
    t.equal(kyori.distance('dishwassher', 'dishwasher pods'), 1);
    t.equal(kyori.distance('dishwashr', 'dishwasher pods'), 1);
    // the candidate may be shorter than what was typed
    t.equal(kyori.distance('food', 'foo'), 1);
    t.equal(kyori.distance('dishwasherr', 'dishwasher'), 1);
    // the first character stays fixed
    t.ok(kyori.distance('xishwasher', 'dishwasher pods') > 1);
    t.end();
});


t.test('kyori/distance() no typo tolerance below three typed characters', (t) => {
    // a two-letter prefix must match exactly; one edit would admit every
    // candidate that shares the first letter
    t.equal(kyori.distance('ab', 'abacus'), 0);
    t.ok(kyori.distance('ab', 'ax pens') > 1);
    t.ok(kyori.distance('ab', 'aqua shoes') > 1);
    t.ok(kyori.distance('ab', 'abacus') < kyori.distance('ab', 'ax pens'));
    t.equal(kyori.distance('a', 'apple'), 0);
    // from three characters on, one typo is allowed
    t.equal(kyori.distance('abc', 'abx pens'), 1);
    t.equal(kyori.distance('fod', 'food'), 1);
    t.end();
});


t.test('kyori/distance() word overlap: the typed words the candidate lacks', (t) => {
    // a later-word match costs the tier alone, never the candidate's length
    t.equal(kyori.distance('pizza', 'margherita pizza'), 2);
    t.equal(kyori.distance('pizza', 'pizza'), 0);
    t.equal(kyori.distance('tennis s', 'black tennis skirt'), 3);
    t.equal(kyori.distance('headphones for ipad kids', 'kids wireless headphones for ipad'), 9);
    // the tier sits above every typed-prefix result: 1 + ⌊|q|/3⌋
    t.equal(kyori.distance('ab', 'ax pens'), 5);
    t.ok(kyori.distance('pizza', 'margherita pizza') > kyori.distance('pizza', 'pizzeria'));
    t.ok(kyori.distance('pizzas', 'margherita pizza') > kyori.distance('pizzas', 'pizzeria x'));
    // each lacking word costs more than any edit count can: |q| + 1
    t.equal(kyori.distance('foo bar', 'foo'), 14);
    t.equal(kyori.distance('foo bar', 'bar'), 14);
    t.equal(kyori.distance('foo bar', 'qux'), 3 + 2 * 8 + 3);
    // a typed word a candidate word starts with is not lacking
    t.equal(kyori.distance('phone case', 'iphone 12 case'), 16);
    t.equal(kyori.distance('case phone', 'phone cases'), 4);
    // the nearest lacking word's edits order inside the count
    t.equal(kyori.distance('art', 'cart'), 7);
    t.equal(kyori.distance('art', 'bart'), 7);
    t.ok(kyori.distance('art', 'cart') < kyori.distance('art', 'xyz'));
    // a candidate with no words: every typed word at its own length
    t.equal(kyori.distance('foo bar', ''), 3 + 2 * 8 + 3);
    t.end();
});


t.test('kyori/distance() word overlap is read from the typed side', (t) => {
    // not the Jaccard similarity: a word the candidate adds costs nothing
    t.equal(kyori.distance('pizza', 'margherita pizza'), 2);
    // (tier 6 for 16 typed characters, one lacking word at 17, 9 edits from
    // 'margherita' to the nearest prefix of 'pizza')
    t.equal(kyori.distance('margherita pizza', 'pizza'), 6 + 17 + 9);
    t.equal(kyori.similarity('pizza', 'margherita pizza'), 0.5);
    t.equal(kyori.similarity('margherita pizza', 'pizza'), 0.5);
    t.end();
});


t.test('kyori/rank() a rule-4 candidate never passes a typed-prefix one', (t) => {
    const ranked = kyori.rank('pizza', ['margherita pizza', 'pizza', 'pizzeria menu', 'pizaa stone', 'calzone']);

    // 'pizaa stone' and 'pizzeria menu' are both one edit from a prefix
    // (rule 3) and the shorter comes first; 'margherita pizza' sits in the
    // tier above them; 'calzone' lacks the one typed word, 4 edits away
    t.strictSame(ranked.map((r) => r.term), ['pizza', 'pizaa stone', 'pizzeria menu', 'margherita pizza', 'calzone']);
    t.strictSame(ranked.map((r) => r.score), [0, 1, 1, 2, 2 + 6 + 4]);
    t.end();
});
