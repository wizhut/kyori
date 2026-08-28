const t = require('tap');

const { transliterate } = require('../src/common/transliterate.js');


t.test('common/transliterate', (t) => {
    t.equal(transliterate('foo'), 'foo');
    t.equal(transliterate(''), '');
    t.equal(transliterate(123), '123');
    t.equal(transliterate('café'), 'cafe');
    t.equal(transliterate('CAFÉ'), 'CAFE');
    t.equal(transliterate('naïve'), 'naive');
    t.equal(transliterate('München'), 'Munchen');
    t.equal(transliterate('Æsir'), 'AEsir');
    t.equal(transliterate('øl'), 'ol');
    t.equal(transliterate('Straße'), 'Strasse');
    t.equal(transliterate('Łódź'), 'Lodz');
    t.equal(transliterate('œuf'), 'oeuf');
    // non-Latin scripts are left as-is
    t.equal(transliterate('距離 sushi'), '距離 sushi');
    t.end();
});
