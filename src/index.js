const { levensthein } = require('./methods/edit_distance/levensthein.js');
const { kyori } = require('./methods/similarity/kyori.js');
const { jaro_winkler } = require('./methods/similarity/jaro_winkler.js');
const { damerau_levensthein } = require('./methods/edit_distance/damerau_levensthein.js');



module.exports = {
    levensthein,
    kyori,
    jaro_winkler,
    damerau_levensthein
};
