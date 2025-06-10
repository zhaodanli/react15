import hasOwnProperty from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

/**
 * 定义了一些保留属性，这些属性不会被存储到 props 中。
 */
const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

/**
 * 检查传入的 config 对象是否包含有效的 ref 属性。 如果 ref 存在，则返回 true。
 * @param {*} config 
 * @returns 
 */
function hasValidRef(config) {
    return config.ref !== undefined;
}

/**
 * 创建一个 React 元素对象（虚拟 DOM）
 * @param {元素的类型（如 div、span 或组件）。} type 
 * @param {唯一标识，用于列表渲染} key 
 * @param {引用，用于访问 DOM 或组件实例} ref 
 * @param {元素的属性} props 
 * @returns 
 */
const ReactElement = (type, key, ref, props) => {
    const element = {
        $$typeof: REACT_ELEMENT_TYPE,
        type,
        key,
        ref,
        props,
    };
    return element;
};


/**
 * 用于在开发环境中创建 React 元素。
 * @param {元素的类型（如 div、组件等} type 
 * @param {包含元素的属性（如 className、id 等）以及保留属性（如 key、ref）} config 
 * @param {可能的 key 值} maybeKey 
 * 17之前 config: {key: "value", ref: "value", className: "value", ...}, children: "value"
 * 17之后 children: "value" 直接放在 config: { children } ; key 在第三个参数中
 * @returns 
 */
export function jsxDEV(type, config, maybeKey) {
    // 初始化
    let propName;
    const props = {};
    let key = null;
    let ref = null;

    // 如果 maybeKey 存在，将其转换为字符串并赋值给 key
    if (typeof maybeKey !== 'undefined') {
        key = "" + maybeKey;
    }
    
    // 如果 config 中有有效的 ref，将其赋值给 ref。
    if (hasValidRef(config)) {
        ref = config.ref;
    }

    for (propName in config) {
        // 将 config 中非保留属性添加到 props 对象中
        if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
            props[propName] = config[propName];
        }
    }
    return ReactElement(type, key, ref, props);
}