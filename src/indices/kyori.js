const { AbstractIndex } = require('./abstract_index.js');
const { kyori } = require('../methods/similarity/kyori.js');


class KyoriIndex extends AbstractIndex {
    search(term) {
        const ranked = [];

        for (let i = 0; i < this.terms.length; i++) {
            const candidate = this.terms[i];

            ranked.push({
                term: candidate,
                score: kyori.similarity(term, candidate)
            });
        }

        ranked.sort((a, b) => {
            if (a.score !== b.score) {
                return a.score - b.score;
            }

            if (a.term < b.term) {
                return -1;
            }

            if (a.term > b.term) {
                return 1;
            }

            return 0;
        });

        return ranked;
    }
}


module.exports = {
    KyoriIndex
};
