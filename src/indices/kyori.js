const { AbstractIndex } = require('./abstract_index.js');
const { prepare, distancePrepared, lengthTieBreak } = require('../methods/similarity/kyori_core.js');
const { rankByKey } = require('../common/method_api.js');


/**
 * A list of terms ordered by Kyori's cost. Each term is folded and tokenised
 * when it is added, so search() folds only the query.
 */
class KyoriIndex extends AbstractIndex {
    constructor() {
        super();
        this.prepared = [];
    }

    addOne(term) {
        super.addOne(term);
        this.prepared.push(prepare(term));
    }

    search(term) {
        const query = prepare(term);
        const prepared = this.prepared;

        return rankByKey(this.terms, (candidate, i) => {
            const text = prepared[i];
            const score = distancePrepared(query, text);

            return { score, key: score + lengthTieBreak(text.text.length) };
        });
    }
}


module.exports = {
    KyoriIndex
};
