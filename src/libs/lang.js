

function allAreNotNil(arrayOfValues) {
    for (let i = 0; i < arrayOfValues.length; i++) {
        if (isNil(arrayOfValues[i])) {
            return false;
        }
    }

    return true;
}


function isNil(value) {
    return value === null || value === undefined;
}


module.exports = {
  isNil,
  allAreNotNil
};
