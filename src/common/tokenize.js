const { lang } = require('@wizhut_tech/wizjs');


function tokenizeTerm(term) {
    if (lang.checks.isNil(term)) {
        return [];
    }

    const strippedTerm = term.trim();

    if (strippedTerm.length === 0) {
        return [];
    }

    return strippedTerm.split(/[\s\-\u2010-\u2014]+/).filter((t) => t.length > 0);
}


module.exports = {
    tokenizeTerm
};
