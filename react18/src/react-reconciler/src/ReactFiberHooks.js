import ReactSharedInternals from "shared/ReactSharedInternals.js";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;


/** 这段代码是 React Fiber 架构中处理函数组件和 Hooks 的核心逻辑。
 *  设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
 * 在函数组件执行前给 ReactCurrentDispatcher.current 赋值
 * @returns 
 */

export function renderWithHooks(current, workInProgress, Component, props) {
    // 设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
    currentlyRenderingFiber = workInProgress;
    workInProgressHook = null;

    if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }

    const children = Component(props);

    // 清除对当前正在渲染的 Fiber 的引用 这里是为了在函数组件中使用 hooks 时，能够正确地记录当前的 Fiber 在函数组件执行完后，清除引用，避免内存泄漏
    currentlyRenderingFiber = null;
    currentHook = null;

    // // 这一步是为了在下次渲染时，能够重新设置当前正在渲染的 Fiber
    // if (children.$$typeof) {
    //     // 如果是单个 React 元素，直接返回
    //     return children;
    // }
    // // 如果是数组，返回第一个元素
    // if (children.length > 0) {
    //     children = children[0];
    // }

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
/**
 * 函数组件 memoizedState 存的 第一次的 hook链表。 后面不再更新
 * 根组件的 memoizedState 存的是vdom elment
 * 原生组件存的什么？
 * @returns 
 */
function mountWorkInProgressHook() {
    const hook = {
        memoizedState: null, // hook 的状态
        // baseState: null,
        // baseQueue: null,
        queue: null, // 存放本hook的更新队列： 里面有pending， 放置了update的双向循环链表
        next: null, // 一个函数会有多个hook, hook 会生成单向链表
    };
    
    if (workInProgressHook === null) {
        // 第一个 hook
        currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
    } else {
        // 后续的 hook
        //  workInProgressHook.next = hook;
        //  workInProgressHook = hook
        workInProgressHook = workInProgressHook.next = hook;
    }
    return workInProgressHook;
}

/**  处理 reducer 的更新逻辑
 * @param {*} fiber 
 * @param {更新队列} queue 
 * @param {执行动作本身} action 
 */
function dispatchReducerAction(fiber, queue, action) {
    const update = {
        action,
        next: null,
    }

    const root = enqueueConcurrentHookUpdate(fiber, queue, update);
    // 调度，执行根上的更新
    scheduleUpdateOnFiber(root, fiber);
    console.log("dispatchReducerAction scheduleUpdateOnFiber",fiber, queue, action);
}

const HooksDispatcherOnUpdateInDEV = {
    useReducer: updateReducer
}

function updateReducer(reducer) {
    // 获取新HOOK
    const hook = updateWorkInProgressHook();
    // 获取新的更新队列
    const queue = hook.queue;
    queue.lastRenderedReducer = reducer;
    const current = currentHook;
    const pendingQueue = queue.pending; // 获取当前 Hook 的待处理队列， 即将要生效的队列
    let newState = current.memoizedState; // 初始化新状态，如果是第一次渲染，newState 就是初始状态
    if (pendingQueue !== null) {
        queue.pending = null; // 清空 pending 队列
        // 如果有待处理的更新
        const first = pendingQueue.next; // 获取第一个更新
        let update = first; // 初始化更新为第一个更新
        // 遍历所有更新
        do {
            if (update.hasEagerState) {
                // 如果更新有急切状态，直接使用急切状态
                newState = update.eagerState;
            }else {
                // 如果没有急切状态，使用 reducer 计算新的状态
                const action = update.action
                newState = reducer(newState, action)
            }
            update = update.next; // 获取下一个更新
        } while (update !== null && update !== first); // 如果回到第一个更新，说明遍历完了所有更新
    }
    hook.memoizedState = queue.lastRenderedState = newState; // 更新 Hook 的状态和 lastRenderedState
    // 返回新的状态和 dispatch 函数
    return [newState, queue.dispatch];
}


/**
 * 假设你有如下组件：
 * const [count, setCount] = useReducer(...); // 第1个hook
 * const [flag, setFlag] = useReducer(...);   // 第2个hook
 * 第一次渲染（mount）
 * React 会依次调用 mountWorkInProgressHook() 两次，生成如下链表：
 * workInProgressFiber.memoizedState --> hook1 --> hook2
 * 第二次渲染（update）
 * 这时 current（上一次的 Fiber）已经有了 hook 链表。
 * 本次渲染时，React 会依次调用 updateWorkInProgressHook() 两次：
 * 第一次调用
 * currentHook 还没有值，进入 if 分支，指向 current.memoizedState（即 hook1）。
 * 创建 newHook1，复制 hook1 的状态，作为本次渲染的第一个 hook。
 * 第二次调用
 * 进入 else 分支，currentHook = currentHook.next;，此时 currentHook 指向 hook2。
 * @returns 
 */
function updateWorkInProgressHook() {
    if (currentHook === null) {
        // 如果当前没有 Hook，说明是第一次渲染
        const current = currentlyRenderingFiber.alternate;
        currentHook = current.memoizedState
    } else {
        // 如果当前有 Hook，说明是更新渲染
        currentHook = currentHook.next;
    }

    const newHook = {
        memoizedState: currentHook.memoizedState,
        // baseState: null,
        // baseQueue: null,
        queue: currentHook.queue,
        next: null,
    }

    if (workInProgressHook === null) {
        // workInProgressHook 代表当前正在处理的 Hook 节点。如果是第一个 Hook，直接挂到 Fiber 的 memoizedState 上（链表头）。
        currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    } else {
        // 如果不是第一个 Hook，就把它挂到上一个 Hook 的 next 上，形成链表，并把 workInProgressHook 指向新节点。
        workInProgressHook = workInProgressHook.next = newHook;
    }

    return workInProgressHook;
}