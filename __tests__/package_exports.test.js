const t = require('tap');

const root = require('../src/index.js');
const pkg = require('../package.json');

const SCOPE = '@wizhut_tech/kyori';


function declaredSubpaths() {
    return Object.keys(pkg.exports)
        .filter((key) => key !== '.' && key !== './package.json')
        .sort();
}


t.test('exports/every method in the public API has a subpath', (t) => {
    const names = Object.keys(root.methods).sort();
    t.ok(names.length > 0, 'the methods namespace is not empty');

    for (const name of names) {
        const subpath = `${SCOPE}/methods/${name}`;
        let mod = null;

        t.doesNotThrow(() => { mod = require(subpath); }, `${subpath} resolves`);

        if (mod !== null) {
            t.equal(
                mod[name],
                root.methods[name],
                `${subpath} exports the same object as methods.${name}`
            );
        }
    }

    t.end();
});


t.test('exports/every method subpath carries the whole method API', (t) => {
    for (const name of Object.keys(root.methods).sort()) {
        const mod = require(`${SCOPE}/methods/${name}`);

        t.type(mod[name].distance, 'function', `${name}.distance`);
        t.type(mod[name].similarity, 'function', `${name}.similarity`);
        t.type(mod[name].rank, 'function', `${name}.rank`);
    }

    t.end();
});


t.test('exports/indices are reachable and identical', (t) => {
    const { KyoriIndex } = require(`${SCOPE}/indices/kyori`);

    t.equal(KyoriIndex, root.indices.KyoriIndex);
    t.type(KyoriIndex, 'function');
    t.end();
});


t.test('exports/every declared subpath resolves to public API objects', (t) => {
    const reachable = new Set([
        ...Object.values(root.methods),
        ...Object.values(root.indices)
    ]);

    for (const subpath of declaredSubpaths()) {
        const mod = require(subpath.replace('.', SCOPE));
        const keys = Object.keys(mod);

        t.ok(keys.length > 0, `${subpath} exports something`);

        for (const key of keys) {
            t.ok(
                reachable.has(mod[key]),
                `${subpath} -> ${key} is reachable from the root import`
            );
        }
    }

    t.end();
});


t.test('exports/root entry point still resolves', (t) => {
    t.equal(require(SCOPE), root);
    t.same(Object.keys(root).sort(), ['indices', 'methods']);
    t.end();
});


t.test('exports/internals stay private', (t) => {
    t.throws(
        () => require(`${SCOPE}/common/method_api`),
        { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' },
        'src/common is not reachable as a subpath'
    );

    t.throws(
        () => require(`${SCOPE}/src/methods/edit_distance/levensthein.js`),
        { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' },
        'the raw src/ layout is not part of the public surface'
    );

    t.throws(
        () => require(`${SCOPE}/methods/does_not_exist`),
        { code: 'ERR_PACKAGE_PATH_NOT_EXPORTED' },
        'an undeclared method subpath does not resolve'
    );

    t.end();
});


t.test('exports/package.json is reachable', (t) => {
    t.equal(require(`${SCOPE}/package.json`).name, SCOPE);
    t.end();
});
