const { AbstractIndex } = require('./abstract_index.js');


class KyoriIndex extends AbstractIndex {
    constructor() {
        super();
    }

    search(term) {
        return super.search(term);
    }
}


module.exports = {
    KyoriIndex
}