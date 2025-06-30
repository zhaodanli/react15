import { useState, useRef } from 'react';
import { toProxy, INTERNAL } from './core';

const isObject = (val) => Object.prototype.toString.call(val) === '[object Object]';
const isArray = (val) => Array.isArray(val);
const isFunction = (val) => typeof val === 'function';

const is = {
    isObject,
    isArray,
    isFunction
}

// 自定义 Hook，用于处理不可变状态
function useImmerState(baseState) {
    // 使用 state 存储状态值
    const [state, setState] = useState(baseState);
    // toProxy 用于创建可变的草稿状态。每当草稿状态更新时，程序会使用 setState 更新实际状态。
    const draftRef = useRef(
        // 将 instate 转换为 Proxy
        toProxy(baseState, () => {
            // 状态值变化时调用，更新组件的 state
            queueMicrotask(() => {
                const internalState = draftRef.current[INTERNAL];

                // 获取草稿状态
                const newState = internalState.draftState;
                setState(() => {
                    // 更新 state
                    return (is.isArray(newState) ? [...newState] : Object.assign({}, newState));
                });
            })
        })
    );

    // 修改草稿状态
    const updateDraft = (producer) => producer(draftRef.current);
    return [state, updateDraft];
}
export default useImmerState;