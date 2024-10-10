
const { isNil } = require("./lang.js");


function tokenizeTerm(term) {
    if (isNil(term)) {
        return [];
    }

    const strippedTerm = term.trim();

    if (term.length === 0) {
        return [];
    }

    const individualTerms = strippedTerm.split(' ');

    return individualTerms.filter((t) => t.length > 0).map((t) => t.trim());
}


module.exports = {
    tokenizeTerm
}
