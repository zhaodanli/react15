import ReactSharedInternals from "shared/ReactSharedInternals.js";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;


/** 这段代码是 React Fiber 架构中处理函数组件和 Hooks 的核心逻辑。
 *  设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
 * @returns 
 */

export function renderWithHooks(current, workInProgress, Component, props) {
    // 设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
    currentlyRenderingFiber = workInProgress;
    workInProgressHook = null;

    if (current !== null && current.memoizedState !== null) {
        // ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }

    const children = Component(props);

    // 清除对当前正在渲染的 Fiber 的引用 这里是为了在函数组件中使用 hooks 时，能够正确地记录当前的 Fiber 在函数组件执行完后，清除引用，避免内存泄漏
    currentlyRenderingFiber = null;

    // 这一步是为了在下次渲染时，能够重新设置当前正在渲染的 Fiber
    if (children.$$typeof) {
        // 如果是单个 React 元素，直接返回
        return children;
    }
    // 如果是数组，返回第一个元素
    if (children.length > 0) {
        children = children[0];
    }

    return children;
}

const HooksDispatcherOnMountInDEV = {
    useReducer: mountReducer
}

function mountReducer(reducer, initialArg) {
    const hook = mountWorkInProgressHook(); // 挂载工作中的 Hook
    hook.memoizedState = initialArg; // 初始化 hook 的状态为初始参数
    // 创建一个队列，用于存储更新
    const queue = {
        pending: null,
        dispatch: null, // 存储 reducer 的更新 包含了所有的更新操作 以及一个 dispatch 函数，用于触发更新
        // 这里是一个 reducer 函数
        // dispatch: (action) => dispatchReducerAction(currentlyRenderingFiber, queue, action),
    };
    hook.queue = queue; // 将队列赋值给 hook 的 queue 属性
    // 这里的 dispatch 函数会调用 dispatchReducerAction 函数 dispatchReducerAction 函数会处理 reducer 的更新逻辑
    const dispatch = (queue.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, queue));
    
    // 返回 hook 的状态和 dispatch 函数
    return [hook.memoizedState, dispatch];
}

// 挂载工作中的 Hook
function mountWorkInProgressHook() {
    const hook = {
        memoizedState: null,
        // baseState: null,
        // baseQueue: null,
        queue: null,
        next: null,
    };
    
    if (workInProgressHook === null) {
        // 第一个 hook
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        // 后续的 hook
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

// 处理 reducer 的更新逻辑
function dispatchReducerAction(fiber, queue, action) {
    console.log("dispatchReducerAction", action);
}