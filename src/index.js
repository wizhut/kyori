const { levensthein } = require('./methods/levensthein.js');
const { kyori } = require('./methods/kyori.js');
const { jaro_winkler } = require('./methods/jaro_winkler.js');
const { damerau_levensthein } = require('./methods/damerau_levensthein.js');



module.exports = {
    levensthein,
    kyori,
    jaro_winkler,
    damerau_levensthein
};
