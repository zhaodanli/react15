import { NAMESPACE_SEP } from './constants';

function prefix(obj, namespace) {
    return Object.keys(obj).reduce((memo, key) => {
        const newKey = `${namespace}${NAMESPACE_SEP}${key}`;
        memo[newKey] = obj[key];
        return memo;
    }, {});
}

// 处理 reducers、 effects 的名称
export default function prefixNamespace(model) {
    if (model.reducers)
        model.reducers = prefix(model.reducers, model.namespace);
    if (model.effects)
        model.effects = prefix(model.effects, model.namespace);
    return model;
}