

class AbstractIndex {
    constructor() {
        this.terms = [];
    }

    addOne(term) {
        this.terms.push(term);
    }

    addMany(terms) {
        this.terms.push(terms);
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
}