const { AbstractIndex } = require('./abstract_index.js');
const { kyori } = require('../methods/similarity/kyori.js');


class KyoriIndex extends AbstractIndex {
    search(term) {
        return kyori.rank(term, this.terms);
    }
}


module.exports = {
    KyoriIndex
};
