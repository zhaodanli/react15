import { createWorkInProgress } from "./ReactFiber.js";
import { beginWork } from "./ReactFiberBeginWork.js";
import { completeWork } from "./ReactFiberCompleteWork.js";
import { commitMutationEffectsOnFiber, commitMutationEffects, commitPassiveUnmountEffects, commitPassiveMountEffects, commitLayoutEffects } from "./ReactFiberCommitWork.js";
import { MutationMask, NoFlags, Placement, Update, ChildDeletion, Passive } from "./ReactFiberFlags.js";
import { HostRoot, HostComponent, HostText, FunctionComponent } from "./ReactWorkTags.js";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";
import { NormalPriority as NormalSchedulerPriority, scheduleCallback as Scheduler_scheduleCallback } from "./Scheduler";
import {
    NoLane,
    markRootUpdated,
    NoLanes,
    getNextLanes,
    getHighestPriorityLane,
    SyncLane,
    includesBlockingLane
} from './ReactFiberLane.js';
import {
    getCurrentUpdatePriority, 
    lanesToEventPriority, 
    DiscreteEventPriority, 
    ContinuousEventPriority,
    DefaultEventPriority, 
    IdleEventPriority,
    setCurrentUpdatePriority
} from './ReactEventPriorities.js';
import { getCurrentEventPriority } from 'react-dom-bindings/src/client/ReactDOMHostConfig.js';
import { scheduleSyncCallback, flushSyncCallbacks } from './ReactFiberSyncTaskQueue';

// 新的 待更新， 正在构建中的 fiber, 相对current 是老的节点 （展示，页面上真实dom, 已经渲染完成的fiber）
let workInProgress = null;
let workInProgressRoot = null;

let rootDoesHavePassiveEffects = false; // 此根节点有没有副作用
let rootWithPendingPassiveEffects = null; // 有 effct 副作用 的根节点， 根fiber 的 stateNode

// 当前正在执行的渲染优先级
let workInProgressRootRenderLanes = NoLanes;

/**
 * 用于调度更新
 * @param {} root 
 */
export function scheduleUpdateOnFiber(root, fiber, lane) {
    markRootUpdated(root, lane);
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root);
}


/**
 * 按计划执行回调
 * performConcurrentWorkOnRoot 作为一个回调任务，交由 React 的调度器（scheduler）管理
 * 以便根据任务的优先级和当前的空闲时间来执行更新任务。这种设计是 React 并发模式（Concurrent Mode）的核心，确保更新任务能够高效且流畅地执行。
 * 将 performConcurrentWorkOnRoot 函数绑定到当前的 root，生成一个回调函数。
 * 这样，当调度器执行任务时，可以将 root 作为参数传递给 performConcurrentWorkOnRoot。
 */
function ensureRootIsScheduled(root) {
    // 从整个 Fiber 树（root）上，计算出“当前所有待处理的 lane（车道）”的合集（即还有哪些优先级的更新没有被处理）。 可能包含多个 lane
    const nextLanes = getNextLanes(root, NoLanes);
    // 从 nextLanes 这个集合中，选出“优先级最高的那个 lane”。这是“当前最紧急需要处理的优先级”。
    const newCallbackPriority = getHighestPriorityLane(nextLanes);
    // 新优先级是同步
    if (newCallbackPriority === SyncLane) { // 同步 如点击事件
        // 调度同步回调 将 performSyncWorkOnRoot 放到同步回调
        scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
        // 将 flushSyncCallbacks 放到微任务
        queueMicrotask(flushSyncCallbacks);
    } else { // 异步
        let schedulerPriorityLevel;
        // 把 lane 转为事件优先级（也是lane表示的）从左往右找第一个最高的
        switch (lanesToEventPriority(nextLanes)) {
            case DiscreteEventPriority:
                schedulerPriorityLevel = ImmediateSchedulerPriority;
                break;
            case ContinuousEventPriority:
                schedulerPriorityLevel = UserBlockingSchedulerPriority;
                break;
            case DefaultEventPriority:
                // 将事件优先级转为调度优先级
                schedulerPriorityLevel = NormalSchedulerPriority;
                break;
            case IdleEventPriority:
                schedulerPriorityLevel = IdleSchedulerPriority;
                break;
            default:
                schedulerPriorityLevel = NormalSchedulerPriority;
                break;
        }
    }
    // if (workInProgressRoot) return;
    // workInProgressRoot = root;
    // scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));

    // NormalSchedulerPriority 优先级 在根上执行并发渲染
    Scheduler_scheduleCallback(NormalSchedulerPriority, performConcurrentWorkOnRoot.bind(null, root));
}

// 调度同步回调
function performSyncWorkOnRoot(root) {
    // 拿到最高优的lane
    const lanes = getNextLanes(root, NoLanes);
    // 同步渲染根节点, 渲染新的fiber树
    renderRootSync(root, lanes);
    // 获取完成的fiber 根节点
    const finishedWork = root.current.alternate
    root.finishedWork = finishedWork
    commitRoot(root)
    // flushSyncCallbacks 执行时是以callback返回null为依据的
    return null;//如果没有任务了一定要返回null
}

/**
 * 执行根节点上的并发更新任务。
 * 在初次渲染时，调用 renderRootSync 以同步方式渲染根节点，尽快将内容展示给用户
 * 在fiber上构建fiber树，把真实节点插入容器
 * @param {*} root 
 */
function performConcurrentWorkOnRoot(root, didTimeout) {
    const lanes = getNextLanes(root, NoLanes);
    if (lanes === NoLanes) {
        return null
    }

    // 判断是否需要时间分片
    const shouldTimeSlice = !includesBlockingLane(root, lanes) && (!didTimeout);
    if (shouldTimeSlice) { // 并发渲染
        renderRootConcurrent(root, lanes)
    } else { // 同步渲染
        renderRootSync(root, lanes);
    }
    // console.log("performConcurrentWorkOnRoot");
    // 初次渲染， 同步渲染根节点 第一次渲染 要尽快给用户看
    // renderRootSync(root)
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    printFiber(finishedWork);
    printFinishedWork(finishedWork)
    commitRoot(root);
    return null;
}

function renderRootConcurrent(root, lanes) {
    console.log(root, lanes);
}

function commitRoot(root) {
    const previousPriority = getCurrentUpdatePriority();

    try {
        // 把当前的更新优先级设置为1， 提交阶段不能去暂停
        setCurrentUpdatePriority(DiscreteEventPriority);
        commitRootImpl(root);
    } finally {
        setCurrentUpdatePriority(previousPriority);
    }
}

function commitRootImpl(root) {
    const { finishedWork } = root;

    workInProgress = null;
    workInProgressRootRenderLanes = null;

    // 判断是否有 effect 副作用
    if ((finishedWork.subtreeFlags & Passive) !== NoFlags || (finishedWork.flags & Passive) !== NoFlags) {
        if (!rootDoesHavePassiveEffects) {
            // 表示跟上有要执行的副作用
            rootDoesHavePassiveEffects = true;
            // 刷新 副作用 开启新的宏任务，等待赋值之后执行
            // scheduleCallback(flushPassiveEffects);
            Scheduler_scheduleCallback(NormalSchedulerPriority, flushPassiveEffects);
        }
    }

    console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
    // MutationMask 插入或者更新
    const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
    const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;

    // 自己 或者 自节点有副作用
    if (subtreeHasEffects || rootHasEffect) {
        // 在fiber上提交变更操作的副作用
        // console.log("commitRoot");
        // commitMutationEffectsOnFiber(finishedWork, root);
        commitMutationEffects(finishedWork, root);
        // 这里执行 layOutEffect的 副作用
        commitLayoutEffects(finishedWork, root);
        // DOM 执行变更后，根节点指向新的 根fiber
        root.current = finishedWork;

        // 重制 root 变量
        if (rootDoesHavePassiveEffects) {
            rootDoesHavePassiveEffects = false;
            // 第一次赋值， 在下一个宏任务执行挂载操作
            rootWithPendingPassiveEffects = root;
        }
    }
    root.current = finishedWork;
}

// 刷新 PassiveEffect
function flushPassiveEffects() {
    // 有要执行副作用的根
    if (rootWithPendingPassiveEffects !== null) {
        const root = rootWithPendingPassiveEffects;
        // 卸载副作用 destory
        commitPassiveUnmountEffects(root.current);
        // 挂载副作用 create
        commitPassiveMountEffects(root, root.current);
    }
}

function printFiber(fiber) {
    /**
     * fiber.flags &= ~Forked;
     * fiber.flags &= ~PlacementDEV;
     * fiber.flags &= ~Snapshot;
     * fiber.flags &= ~PerformedWork;
     */
    if (fiber.flags !== 0) {
        console.log(
            'printFiber >>>>>>>>>>>>>>>>>',
            getFlags(fiber),
            getTag(fiber.tag),
            typeof fiber.type === "function" ? fiber.type.name : fiber.type,
            fiber.memoizedProps
        );
        if (fiber.deletions) {
            for (let i = 0; i < fiber.deletions.length; i++) {
                const childToDelete = fiber.deletions[i];
                console.log(
                    'printFiber >>>>>>>>>>>>>>>>>',
                    'fiber.deletions >>>>>>>>>>>>>>>>>',
                    getTag(childToDelete.tag),
                    childToDelete.type,
                    childToDelete.memoizedProps
                );
            }
        }
    }
    let child = fiber.child;
    while (child) {
        printFiber(child);
        child = child.sibling;
    }
}

function getTag(tag) {
    switch (tag) {
        case FunctionComponent:
            return `FunctionComponent`;
        case HostRoot:
            return `HostRoot`;
        case HostComponent:
            return `HostComponent`;
        case HostText:
            return HostText;
        default:
            return tag;
    }
}

function printFinishedWork(fiber) {
    const { flags, tag, type, deletions } = fiber;
    if ((flags & ChildDeletion) !== NoFlags) {
        fiber.flags &= ~ChildDeletion;
        console.log(
            '子节点有删除' +
            (deletions.map(fiber => `${fiber.type}#${fiber.memoizedProps.id}`).join(', '))
        );
    }
    let child = fiber.child;
    while (child) {
        printFinishedWork(child);
        child = child.sibling;
    }

    if (fiber.flags === NoFlags) {
        console.log(
            getFlags(fiber),
            getTag(fiber.tag),
            typeof fiber.type === 'function' ? fiber.type.name : type,
            fiber.memoizedProps
        );
    }
}

function getFlags(fiber) {
    const { flags, deletions } = fiber;
    if (flags === (Update | Placement | ChildDeletion)) {
        return `自己移动和子元素有删除`;
    }
    if (flags === (ChildDeletion | Update)) {
        return `自己有更新和子元素有删除`;
    }
    if (flags === ChildDeletion) {
        return `子元素有删除` + deletions.map(fiber => `${fiber.type}#${fiber.memoizedProps.id}`).join(', ');
    }
    if (flags === (Placement | Update)) {
        return `移动并更新`;
    }
    if (flags === Placement) {
        return `插入`;
    }
    if (flags === Update) {
        return `更新`;
    }
    return flags;
}

/**
 * 构建新的 Fiber 树，并同步执行更新任务。
 * @param {*} root 
 */
function renderRootSync(root, lanes) {
    // 新的根和老的根不一样 或者 新的渲染优先级和老的渲染优先级不一样
    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
        // 为根节点创建新的 Fiber 栈 创建新的HOSTRootFiber === workInProgress（正在构建的
        prepareFreshStack(root, lanes);
    }
    // 遍历 workInProgress 树，依次执行每个 Fiber 节点的更新任务。同步工作循环 
    workLoopSync();
}

/**
 * 为根节点创建新的 Fiber 栈。
 * 基于 root.current（当前 Fiber 树）创建 workInProgress（正在构建的 Fiber 树）。
 * @param {*} root 
 */
function prepareFreshStack(root, lanes) {
    // 创建新的HOSTRootFiber
    workInProgress = createWorkInProgress(root.current, null);
    workInProgressRootRenderLanes = lanes;
    // console.log('workInProgress>>>>>>>>>>>', workInProgress);
    // 完成队列的的并发更新
    finishQueueingConcurrentUpdates();
}

function workLoopSync() {
    while (workInProgress !== null) {
        // 执行工作单元
        performUnitOfWork(workInProgress);
    }
}
/**
 * 在当前 Fiber 节点上执行更新任务
 * 如果当前节点有子节点，继续处理子节点；如果没有子节点，标记任务完成。
 * @param {*} unitOfWork 
 */
function performUnitOfWork(unitOfWork) {
    // 获取新fiber对应的老fiber
    const current = unitOfWork.alternate;
    // 调用 beginWork，在当前节点上执行更新任务，并返回下一个需要处理的节点。 开始在 unitOfWork 进行更新工作
    const next = beginWork(current, unitOfWork, workInProgressRootRenderLanes);
    // 把等待生效的标称已经生效的
    unitOfWork.memoizedProps = unitOfWork.pendingProps;
    // 没有子节点，代表完成了
    if (next === null) {
        completeUnitOfWork(unitOfWork);
        // workInProgress = null;
    } else {
        workInProgress = next;
    }
}

function completeUnitOfWork(unitOfWork) {
    let completedWork = unitOfWork;
    do {
        const current = completedWork.alternate;
        const returnFiber = completedWork.return;
        completeWork(current, completedWork);

        const siblingFiber = completedWork.sibling;
        if (siblingFiber) {
            workInProgress = siblingFiber;
            return;
        }
        completedWork = returnFiber;
        workInProgress = completedWork;
    } while (completedWork !== null)
}

/** 将 根据lane 转换为事件优先级
 */
export function requestUpdateLane() {
    // 获取当前更新优先级
    const updateLane = getCurrentUpdatePriority();
    if (updateLane !== NoLane) {
        return updateLane;
    }
    // 取事件优先级赛道
    const eventLane = getCurrentEventPriority();
    return eventLane;
}