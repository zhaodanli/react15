const nodes = new Map();

function atom(options) {
    let value = options.default;
    let node = {
        key: options.key,
        get: () => {
            return value;
        },
        set: (newValue) => {
            value = newValue;
        }
    }
    nodes.set(node.key, node);
    return node;
}

function getNode(key) {
    return nodes.get(key);
}

export default atom;

export {
    getNode
}