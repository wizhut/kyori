const { isNil } = require('@wizhut_tech/wizjs/lang/checks');

function allAreNotNil(arrayOfValues) {
    if (arrayOfValues.length === 0) {
        return false;
    }

    for (let i = 0; i < arrayOfValues.length; i++) {
        if (isNil(arrayOfValues[i])) {
            return false;
        }
    }

    return true;
}

module.exports = {
  allAreNotNil
};
