import { REACT_ELEMENT, REACT_TEXT } from './constants'

export function toVdom(element) {
    if(typeof element === 'string' || typeof element === 'number') {
        return {
            $$typeof: REACT_ELEMENT,
            type: REACT_TEXT,
            props: element
        }
    } else {
        return element;
    }
}

// 浅比较
export function shallowEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true; // 引用相等，直接返回 true
    }
    if (typeof obj1 != "object" || obj1 === null || typeof obj2 != "object" || obj2 === null) {
        return false; // 如果不是对象或有一个为 null，返回 false
    }
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false; // 如果键的数量不同，返回 false
    }
    for (let key of keys1) {
        if (!obj2.hasOwnProperty(key) || obj1[key] !== obj2[key]) {
            return false; // 如果键不存在或值不同，返回 false
        }
    }
    return true; // 所有键和值都相等，返回 true
}