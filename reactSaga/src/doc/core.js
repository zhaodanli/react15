const isObject = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isArray = (val) => Array.isArray(val);
const isFunction = (val) => typeof val === 'function';

const is = {
    isObject,
    isArray,
    isFunction
}

// 定义一个唯一的符号，用于内部操
export const INTERNAL = Symbol('INTERNAL');

// produce 函数用于修改状态
export function produce(baseState, producer) {
    // 将 baseState 转换为 Proxy
    const proxy = toProxy(baseState);
    // 触发用户的状态更新逻辑
    producer(proxy);
    const internal = proxy[INTERNAL];
    // 返回更新后的状态，或者原有状态（如果没有修改）
    return internal.mutated ? internal.draftState : baseState;
}

// toProxy：用于创建一个 Proxy 实例
export function toProxy(baseState, valueChange) {
    // 存储访问过的属性
    let keyToProxy = {};

    let internal = {
        draftState: createDraftState(baseState),
        keyToProxy,
        mutated: false
    }

    // 创建一个草稿状态
    function createDraftState(baseState) {
        // 创建草稿状态副本
        if (is.isArray(baseState)) { // 返回数组副本
            return [...baseState];
        } else if (is.isObject(baseState)) { // 返回对象副本
            return Object.assign({}, baseState);
        } else { // 基本类型直接返回
            return baseState;
        }
    }

    // baseState {name: {child: 'a'}} 
    return new Proxy(baseState, {
        // target: {name: {child: 'a'}}  key "name"
        get(target, key) {
            // 处理获取属性逻辑
            if (key === INTERNAL) {
                return internal; // 特殊的内部属性
            }

            const value = target[key];
            // 如果属性是对象或数组，创建新的 Proxy
            if (is.isObject(value) || is.isArray(value)) {
                //  有已经存储的值，直接 返回现有 Prox
                if (key in keyToProxy) {
                    return keyToProxy[key];
                } else {
                    // 第一次没有值， 先赋值
                    keyToProxy[key] = toProxy(value, () => {
                        internal.mutated = true; // 标记为已修改

                        // 从 keyToProxy 中获取当前属性对应的 Proxy。如果之前已经为该属性创建了 Proxy，那么这里就获取到它。这样方便以后对此属性值的访问和变更。
                        const proxyOfChild = keyToProxy[key];

                        // draftState 为当前草稿态
                        const { draftState } = proxyOfChild[INTERNAL];

                        // 更新父级草稿状态
                        internal.draftState[key] = draftState; // 追踪子 Proxy 的状态变化
                        valueChange && valueChange(); // 触发外部变化
                    })
                    // 返回值
                    return keyToProxy[key];
                }
            } else if (is.isFunction(value)) {
                internal.mutated = true; // 标记为已修改
                valueChange && valueChange(); // 触发外部变化
                return value.bind(internal.draftState);
            }
            return internal.mutated ? internal.draftState[key] : baseState[key];
        },
        
        set(target, key, value) {
            internal.mutated = true; // 标记为已修改
            let { draftState } = internal; 
            // 将目标对象的剩余键值对复制到 draftState
            for (const key in target) {
                draftState[key] = key in draftState ? draftState[key] : target[key];
            }
            // 更新草稿状态
            draftState[key] = value;
            valueChange && valueChange(); // 触发变化
            return true;
        }
    });
}

