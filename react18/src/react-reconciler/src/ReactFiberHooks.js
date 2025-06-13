import ReactSharedInternals from "shared/ReactSharedInternals.js";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { scheduleUpdateOnFiber, requestUpdateLane } from "./ReactFiberWorkLoop";
import is from "shared/objectIs";

import { Passive as PassiveEffect, Update as UpdateEffect } from "./ReactFiberFlags";
import { HasEffect as HookHasEffect, Passive as HookPassive, Layout as HookLayout } from "./ReactHookEffectTags";

import { NoLanes, NoLane } from './ReactFiberLane';

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

/**
 * Effects {
    {type: useEffect1, creat: useEffect1fn， destory: useEffect1returnFn},
    {type: useLayoutEffect1, creat: useLayoutEffect1fn， destory: useLayoutEffect1returnFn},
    {type: useEffect2, creat: useEffect2fn， destory: useEffect2returnFn},
    {type: useLayoutEffect2, creat: useLayoutEffect2fn， destory: useLayoutEffect2returnFn},
}
commit 提供阶段 
    commitBeforeMutationEffects 更新前
    commitMutationEffects 更新
    commitHookLayOutEffects 更新后
commit 完成后初次挂载

    更新前 执行commitHookLayOutEffects的时候执行  
        useLayoutEffect1fn， useLayoutEffect2fn	
        在下一个宏任务中  执行 useEffect1fn，useEffect2fn更新
    更新后 在commitMutationEffects 的时候执行 
        同步执行 useLayoutEffect1returnFn， useLayoutEffect2returnFn
        在下一个宏任务异步执行 useEffect1returnFn，useEffect2returnFn	
        在下一个宏任务异步执行 useEffect1fn，useEffect2fn
*/
const HooksDispatcherOnMountInDEV = {
    useReducer: mountReducer,
    useState: mountState,
    useEffect: mountEffect, // 绘制之后执行
    useLayoutEffect: mountLayoutEffect, // 绘制之前执行
    useRef: mountRef,
}

const HooksDispatcherOnUpdateInDEV = {
    useReducer: updateReducer,
    useState: updateState,
    useEffect: updateEffect,
    useLayoutEffect: updateLayoutEffect,
    useRef: updateRef
}


/** 这段代码是 React Fiber 架构中处理函数组件和 Hooks 的核心逻辑。
 *  设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
 * 在函数组件执行前给 ReactCurrentDispatcher.current 赋值
 * @returns 
 */

/**
 * 参考流程（React 源码）
 * dispatchReducerAction → enqueueConcurrentHookUpdate
 * scheduleUpdateOnFiber → 调度流程
 * finishQueueingConcurrentUpdates → update 挂到 queue.pending
 * render 阶段调用 updateReducer，pendingQueue 才有值
 */

export function renderWithHooks(current, workInProgress, Component, props) {
    // 设置当前正在渲染的 Fiber，并初始化 Hooks 调度器。
    currentlyRenderingFiber = workInProgress;

    /** >>>>> 每次渲染前都要清空这两个字段，确保本次渲染时重新生成新的 hook 链表和 
 *            effect 队列，防止上次遗留数据影响本次渲染。 <<<<<< */
    // 存储当前 Fiber 上的副作用队列（如 effect 链表）。
    // 主要用于保存 useEffect/useLayoutEffect 等副作用相关的信息，commit 阶段会统一处理。
    // 保存 effect 副作用链表（如 useEffect 的 effect 信息）。
    workInProgress.updateQueue = null;
    // 存储当前 Fiber 上的hook 链表的头节点。每个 hook（如 useState/useEffect）会形成一个链表，挂在该字段上。
    // 用于保存每个 hook 的状态（如 useState 的 state、useEffect 的 effect 信息等）。
    // 保存 hook 链表（每个 hook 的状态）。
    workInProgress.memoizedState = null;

    if (current !== null && current.memoizedState !== null) {
        ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
    } else {
        ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
    }

    const children = Component(props);

    // 清除对当前正在渲染的 Fiber 的引用 这里是为了在函数组件中使用 hooks 时，
    // 能够正确地记录当前的 Fiber 在函数组件执行完后，清除引用，避免内存泄漏
    currentlyRenderingFiber = null;
    workInProgressHook = null;
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

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 挂载 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
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

/** “急切计算”优化：提前用 reducer 计算新状态，如果没变化就不调度更新。
 * @param {*} initialState 
 * @returns 
 */
function mountState(initialState) {
    // return mountReducer(basicStateReducer, initialState); // 使用基本的状态 reducer 挂载状态
    // 1. 创建一个新的 hook 节点，并挂到当前 Fiber 的 hook 链表上
    const hook = mountWorkInProgressHook();
    // 2. 初始化 hook 的状态为初始参数
    hook.memoizedState = initialState; // 初始化 hook 的状态为初始参数
    // 3. 创建一个队列对象，用于存储本 hook 的所有更新
    const queue = {
        pending: null, // 待处理的更新队列（循环链表）
        dispatch: null, // setState 函数
        //  >>>>>>>>>>>>> 优化部分: 有“急切计算”优化 <<<<<<<<<<<<<<<
        lastRenderedReducer: basicStateReducer, // 用于 useState 的 reducer
        lastRenderedState: initialState, // 上一次渲染的状态
    };

    // 4. 将队列对象挂到 hook 上
    hook.queue = queue; // 将队列赋值给 hook 的 queue 属性
    // 5. 创建 setState 函数，并绑定当前 Fiber 和 queue，保证后续更新能找到正确的队列
    const dispatch = (queue.dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue));

    // 6. 返回当前状态和 setState 函数
    return [hook.memoizedState, dispatch];
}

function mountEffect(create, deps) {
    return mountEffectImpl(PassiveEffect, HookPassive, create, deps);
}

// 负责把 useEffect 的副作用信息收集到 updateQueue 上，供 commit 阶段统一处理。
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
    // 创建一个新的 hook 节点
    const hook = mountWorkInProgressHook();
    // 处理依赖数组 deps。
    const nextDeps = deps === undefined ? null : deps;
    // 给当前 Fiber 打上副作用标记（如 PassiveEffect）
    currentlyRenderingFiber.flags |= fiberFlags;
    // 把 effect 信息（create、deps 等）通过 pushEffect 挂到 hook.memoizedState 上。
    hook.memoizedState = pushEffect(HookHasEffect | hookFlags, create, undefined, nextDeps);
}

function pushEffect(tag, create, destroy, deps) {
    // 创建一个 effect 对象，包含 effect 的类型、回调、依赖等。
    const effect = {
        tag,
        create,
        destroy,
        deps,
        next: null,
    }
    // 获取当前 Fiber 的 updateQueue（副作用队列）。
    let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
    if (componentUpdateQueue === null) {
        // 如果没有队列，创建一个新的队列，并把 effect 挂上去（形成循环链表）。
        componentUpdateQueue = createFunctionComponentUpdateQueue();
        currentlyRenderingFiber.updateQueue = componentUpdateQueue;
        componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
        // 如果已有队列，把 effect 加到链表尾部，维护循环结构
        const lastEffect = componentUpdateQueue.lastEffect;
        if (lastEffect === null) {
            componentUpdateQueue.lastEffect = effect.next = effect;
        } else {
            const firstEffect = lastEffect.next;
            lastEffect.next = effect;
            effect.next = firstEffect;
            componentUpdateQueue.lastEffect = effect;
        }
    }
    // 返回 effect 对象
    return effect;
}

function createFunctionComponentUpdateQueue() {
    return {
        lastEffect: null,
    }
}

function mountLayoutEffect(create, deps) {
    const fiberFlags = UpdateEffect;
    return mountEffectImpl(fiberFlags, HookLayout, create, deps);
}

function mountRef(initialValue) {
    const hook = mountWorkInProgressHook();
    const ref = {
        current: initialValue,
    };
    hook.memoizedState = ref;
    return ref;
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


/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 挂载辅助 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
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
    console.log("dispatchReducerAction scheduleUpdateOnFiber", fiber, queue, action);
}

function dispatchSetState(fiber, queue, action) {
    // 获取/ 请求当前的更新赛道
    const lane = requestUpdateLane(fiber);
    const update = {
        lane,
        action,
        next: null,
        hasEagerState: false, // 是否有急切状态
        eagerState: null, // 急切状态
    };


    // 什么时候应该做急切判断
    // 批量更新逻辑，
    /**
     * 1. 这里的 if 判断用于**“急切计算”优化**（eager state optimization）。
        * 当 fiber.lanes === NoLane 并且 alternate.lanes === NoLanes，说明当前 fiber 及其备份 fiber 上都没有未处理的更新
        * 这时可以安全地用上一次渲染用的 reducer 和 state，直接计算本次 action 的新状态（eagerState）。
     */
    // 这两个关键代码片段分别解决了 React 18 并发批量更新中的「重复调度」和「无效更新」问题
    // 提前计算新状态（eager state），如果新旧状态相同，直接跳过，不入队、不调度、不触发渲染。
    const alternate = fiber.alternate;
    if (fiber.lanes === NoLane && (alternate === null || alternate.lanes === NoLanes)) {
        // 获取上次渲染用的 reducer 和 state
        const lastRenderedReducer = queue.lastRenderedReducer;
        const currentState = queue.lastRenderedState;
        // 计算“急切状态” 利用上次状态和上次reducer结合本次action 进行计算新状态
        const eagerState = lastRenderedReducer(currentState, action);
        update.hasEagerState = true; // 标记为急切状态
        update.eagerState = eagerState; // 计算急切状态

        // 如果新旧状态相同，直接跳过，不触发更新
        if (is(eagerState, currentState)) {
            return; // 如果急切状态和当前状态相同，不需要更新
        }

    }

    // 入队 并 调度
    const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    scheduleUpdateOnFiber(root, fiber, lane);
}

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 派发阶段 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
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
            // >>>>>>>>> 急切更新优化项 <<<<<<<<<<<<<<<<
            if (update.hasEagerState) {
                // 如果更新有急切状态，直接使用急切状态
                newState = update.eagerState;
            } else {
                // 如果没有急切状态，使用 reducer 计算新的状态
                const action = update.action
                newState = reducer(newState, action)
            }
            update = update.next; // 获取下一个更新
        } while (update !== null && update !== first); // 如果回到第一个更新，说明遍历完了所有更新
    }
    hook.memoizedState = queue.lastRenderedState = newState; // 更新 Hook 的状态和 lastRenderedState

    console.log("updateReducer>>>>>>>>>>>>>>", newState, queue.lastRenderedState, queue.lastRenderedReducer)
    // 返回新的状态和 dispatch 函数
    return [newState, queue.dispatch];
}

function updateState(initialState) {
    return updateReducer(basicStateReducer, initialState);
}

function updateEffect(create, deps) {
    return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
}

function updateLayoutEffect(create, deps) {
    return updateEffectImpl(UpdateEffect, HookLayout, create, deps);
}

function updateRef() {
    const hook = updateWorkInProgressHook();
    return hook.memoizedState;
}

function basicStateReducer(state, action) {
    return typeof action === "function" ? action(state) : action;
}

function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
    const hook = updateWorkInProgressHook();
    const nextDeps = deps === undefined ? null : deps;
    let destroy;
    // 拿到老hook
    if (currentHook !== null) {
        const prevEffect = currentHook.memoizedState; // 上一次的 effect 信息
        destroy = prevEffect.destroy; // 上一次的清理函数
        if (nextDeps !== null) {
            const prevDeps = prevEffect.deps; // 上一次的依赖
            if (areHookInputsEqual(nextDeps, prevDeps)) {
                // 依赖没变，不需要执行 effect，只收集 effect 信息，不打副作用标记
                // 这里的 hookFlags 只包含 effect 的类型（如 Passive、Layout），没有包含 HookHasEffect 标记。
                // 仅把 effect 信息（create、destroy、deps）收集到链表上，但不标记本次 commit 需要执行 effect。
                // 依赖没变时，不需要重复执行 effect，只需保留 effect 信息，方便后续卸载时清理
                // 不管是不是变化，都会保证完整循环链表
                hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
                return;
            }
        }
    }
    // 依赖变了，或者首次渲染，或者没有依赖，打上副作用标记
    currentlyRenderingFiber.flags |= fiberFlags;
    // 收集 effect 信息，标记本 effect 需要执行
    hook.memoizedState = pushEffect(HookHasEffect | hookFlags, create, destroy, nextDeps);
}

function areHookInputsEqual(nextDeps, prevDeps) {
    if (prevDeps === null) {
        return false;
    }
    for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
        if (is(nextDeps[i], prevDeps[i])) {
            continue;
        }
        return false;
    }
    return true;
}

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 其他 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
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