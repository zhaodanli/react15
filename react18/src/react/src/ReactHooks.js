import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

/** 实现了 useReducer 的“代理分发”，保证 hooks 能在不同阶段有不同的行为。
 * 这是 React hooks 系统的基础设计之一。
 * useReducer 实际调用的是当前 dispatcher 的实现，dispatcher 由 React 渲染流程动态切换，保证 hooks 行为正确。
 */
/** 关联 hooks
 * 从全局的 ReactCurrentDispatcher.current 获取当前的 hooks 调度器（dispatcher）
 * dispatcher 负责具体实现 hooks 的行为（比如在 mount 阶段和 update 阶段有不同实现）。
 * @returns 
 */
function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

/** 对外暴露的 useReducer 实际上是调用当前 dispatcher 上的 useReducer 方法。
 *  dispatcher 负责具体实现 hooks 的行为（比如在 mount 阶段和 update 阶段有不同实现）。
 * 这样可以根据当前渲染阶段动态切换 hooks 的实现（如 mount/useReducer、update/useReducer）。
 * @param {处理函数，根据老动作计算新状态} reducer 
 * @param {初始状态} initialArg 
 * @param {*} init 
 * @returns 
 */
export function useReducer(reducer, initialArg, init) {
    // 找到派发器
    const dispatcher = resolveDispatcher();
    // 执行派发器的 useReducer， 函数执行前给 useReducer 到 dispatcher
    return dispatcher.useReducer(reducer, initialArg, init);
}

export function useState(initialState) {
    // 找到派发器
    const dispatcher = resolveDispatcher();
    // 执行派发器的 useState， 函数执行前给 useState 到 dispatcher
    return dispatcher.useState(initialState);
}

export function useEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useEffect(create, deps);
}

export function useLayoutEffect(create, deps) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useLayoutEffect(create, deps);
}