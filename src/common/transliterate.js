// Letters that do not NFD-decompose to ASCII (ligatures, strokes, eth/thorn, etc.)
const SPECIALS = {
    'Æ': 'AE',
    'æ': 'ae',
    'Ð': 'D',
    'ð': 'd',
    'Ø': 'O',
    'ø': 'o',
    'Þ': 'Th',
    'þ': 'th',
    'ß': 'ss',
    'Đ': 'D',
    'đ': 'd',
    'Ħ': 'H',
    'ħ': 'h',
    'ı': 'i',
    'Ĳ': 'IJ',
    'ĳ': 'ij',
    'ĸ': 'k',
    'Ł': 'L',
    'ł': 'l',
    'ŉ': "'n",
    'Ŋ': 'NG',
    'ŋ': 'ng',
    'Œ': 'OE',
    'œ': 'oe',
    'Ŧ': 'T',
    'ŧ': 't',
    'ſ': 's'
};


function transliterate(str) {
    if (typeof str !== 'string') {
        str = String(str);
    }

    const nfd = str.normalize('NFD');
    let out = '';

    for (let i = 0; i < nfd.length; i++) {
        const ch = nfd[i];
        const mapped = SPECIALS[ch];

        if (mapped !== undefined) {
            out += mapped;
            continue;
        }

        const code = ch.charCodeAt(0);

        // Combining Diacritical Marks (U+0300–U+036F)
        if (code >= 0x0300 && code <= 0x036F) {
            continue;
        }

        out += ch;
    }

    return out;
}


module.exports = {
    transliterate
};
