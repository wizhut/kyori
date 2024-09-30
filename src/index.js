const { levensthein } = require('./methods/levensthein.js');
const { kyori } = require('./methods/kyori.js');
const { jaro_winkler } = require('./methods/jaro_winkler.js');



module.exports = {
    levensthein,
    kyori,
    jaro_winkler
};