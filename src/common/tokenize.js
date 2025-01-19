const { lang } = require('@wizhut_tech/wizjs');


function tokenizeTerm(term) {
    if (lang.checks.isNil(term)) {
        return [];
    }

    const strippedTerm = term.trim();

    if (term.length === 0) {
        return [];
    }

    return strippedTerm.split(' ').filter((t) => t.length > 0).map((t) => t.trim());
}


module.exports = {
    tokenizeTerm
}
