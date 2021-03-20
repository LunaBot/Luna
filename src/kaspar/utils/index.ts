export function * dedupeGenerator(generator: Generator<any>) {
    const values = new Set(generator);
    for (let value of values) {
        yield value;
    }
};

const getProps = function* (object: Object) {
    // Ignore non-objects
    if (object === Object.prototype) return;
    // Get all props
    for (let name of Object.getOwnPropertyNames(object)) {
        // Ignore contructor
        if (object[name] instanceof Function && name !== 'constructor') yield name;
    }
    // Get parent
    yield* getProps(Object.getPrototypeOf(object));
};

export abstract class EnumeratableClass {
    [Symbol.iterator]: () => Generator<any, void, any>;

    constructor() {
        const obj = this;

        this[Symbol.iterator] = function*() {
            yield* dedupeGenerator(getProps(obj));
        }
    }
}
