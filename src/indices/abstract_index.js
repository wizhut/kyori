class AbstractIndex {
    constructor() {
        this.terms = [];
    }

    addOne(term) {
        this.terms.push(term);
    }

    addMany(terms) {
        if (!Array.isArray(terms)) {
            this.addOne(terms);
            return;
        }

        for (let i = 0; i < terms.length; i++) {
            this.addOne(terms[i]);
        }
    }

    count() {
        return this.terms.length;
    }

    search(term) {
        return [];
    }
}


module.exports = {
    AbstractIndex
};
