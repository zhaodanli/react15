import { createWorkInProgress } from "./ReactFiber.js";
import { beginWork } from "./ReactFiberBeginWork.js";
import { completeWork } from "./ReactFiberCompleteWork.js";
import { commitMutationEffectsOnFiber, commitMutationEffects, commitPassiveUnmountEffects, commitPassiveMountEffects, commitLayoutEffects } from "./ReactFiberCommitWork.js";
import { MutationMask, NoFlags, Placement, Update, ChildDeletion, Passive } from "./ReactFiberFlags.js";
import { HostRoot, HostComponent, HostText, FunctionComponent } from "./ReactWorkTags.js";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";
import { 
    NormalPriority as NormalSchedulerPriority, 
    scheduleCallback as Scheduler_scheduleCallback, 
    shouldYield, 
    cancelCallback as Scheduler_cancelCallback, 
    now 
} from "./Scheduler";
import {
    NoLane,
    markRootUpdated,
    NoLanes,
    getNextLanes,
    getHighestPriorityLane,
    SyncLane,
    includesBlockingLane,
    markStarvedLanesAsExpired, includesExpiredLane,
    mergeLanes, markRootFinished, NoTimestamp
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

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 并发渲染 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
const RootInProgress = 0; // fiber 构建进行中
const RootCompleted = 5; // fiber 构建已完成
let workInProgressRootExitStatus = RootInProgress; // fiber 构建已结束

let currentEventTime = NoTimestamp;


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 饥饿问题 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function cancelCallback(callbackNode) {
    console.log('cancelCallback>>>>>>>>>>>>>>>>>>>>>');
    return Scheduler_cancelCallback(callbackNode);
}

/**
 * 用于调度更新
 * @param {} root 
 */
export function scheduleUpdateOnFiber(root, fiber, lane, eventTime) {
    markRootUpdated(root, lane);
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root, eventTime);
}


/**
 * 按计划执行回调
 * performConcurrentWorkOnRoot 作为一个回调任务，交由 React 的调度器（scheduler）管理
 * 以便根据任务的优先级和当前的空闲时间来执行更新任务。这种设计是 React 并发模式（Concurrent Mode）的核心，确保更新任务能够高效且流畅地执行。
 * 将 performConcurrentWorkOnRoot 函数绑定到当前的 root，生成一个回调函数。
 * 这样，当调度器执行任务时，可以将 root 作为参数传递给 performConcurrentWorkOnRoot。
 */
function ensureRootIsScheduled(root, currentTime) {
    // >>>>>>>>>>> 高优先级打断低优先级 <<<<<<<<<<<<<<<<<<<
    // 获取当前跟上任务
    const existingCallbackNode = root.callbackNode;

    // 解决饥饿问题，设置事件
    markStarvedLanesAsExpired(root, currentTime);

    // 将当前正在渲染车道
    const nextLanes = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes);
    // 从整个 Fiber 树（root）上，计算出“当前所有待处理的 lane（车道）”的合集（即还有哪些优先级的更新没有被处理）。 可能包含多个 lane
    // const nextLanes = getNextLanes(root, NoLanes);

    // 先判断当前根节点是否有待处理的任务（nextLanes），如果没有，root.callbackNode = null。
    if (nextLanes === NoLanes) {
        root.callbackNode = null;
        root.callbackPriority = NoLane;
        return;
    }

    // debugger

    // 从 nextLanes 这个集合中，选出“优先级最高的那个 lane”。这是“当前最紧急需要处理的优先级”。
    const newCallbackPriority = getHighestPriorityLane(nextLanes);
    // 处理批量更新逻辑
    // 这两个关键代码片段分别解决了 React 18 并发批量更新中的「重复调度」和「无效更新」问题
    // 防止重复调度同一优先级的任务，实现批量合并。
    // 如果当前根节点（root）已经有一个相同优先级的调度任务在排队，就不需要再重复调度一次。
    // callbackPriority 是 现在根上正在运行的优先级
    // 如果 root.callbackNode 存在，且优先级发生变化（existingCallbackPriority !== newCallbackPriority），则调用 cancelCallback(existingCallbackNode) 取消旧的调度任务。
    // 这样可以防止低优先级任务被高优先级任务“饿死”，也避免重复调度。
    const existingCallbackPriority = root.callbackPriority;
    if (existingCallbackPriority === newCallbackPriority) {
        return;
    }

    // 如果有新任务，且优先级发生变化，会先取消旧的回调（见下文“取消”）。
    if (existingCallbackNode !== null) {
        console.log('Scheduler_cancelCallback>>>>>>>>>>>>>>>>>>>>')
        cancelCallback(existingCallbackNode);
    }

    // 获取下一个回调
    let newCallbackNode;

    // 根据优先级（同步/异步）：
    if (newCallbackPriority === SyncLane) { // 同步 如点击事件
        // 调度同步回调 将 performSyncWorkOnRoot 放到同步回调
        scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
        // 将 flushSyncCallbacks 放到微任务
        queueMicrotask(flushSyncCallbacks);

        // 同步任务：newCallbackNode = null，同步任务直接执行，不需要调度器回调。
        newCallbackNode = null; // 同步执行完成清空回调
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
        // 异步任务：通过 Scheduler_scheduleCallback 创建调度回调，返回的回调句柄赋值给 root.callbackNode 先new Task，返回 new Task
        newCallbackNode = Scheduler_scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot.bind(null, root))
    }

    // if (workInProgressRoot) return;
    // workInProgressRoot = root;
    // scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));

    // NormalSchedulerPriority 优先级 在根上执行并发渲染

    root.callbackPriority = newCallbackPriority; // 第一次渲染 赋值优先级
    root.callbackNode = newCallbackNode;
}

// 调度同步回调
function performSyncWorkOnRoot(root) {
    console.log('performSyncWorkOnRoot>>>>>>>>>>>>')
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
    // console.log('performConcurrentWorkOnRoot>>>>>>>>>>>>>>>>>')
    const originalCallbackNode = root.callbackNode;
    const lanes = getNextLanes(root, NoLanes);
    if (lanes === NoLanes) {
        return null
    }

    const nonIncludesBlockingLane = !includesBlockingLane(root, lanes);
    const nonIncludesExpiredLane = !includesExpiredLane(root, lanes);
    const nonTimeout = !didTimeout;

    // 判断是否需要时间分片：不包含阻塞车道 并且没有超时
    // 默认是同步的， allowConcurrentByDefault 默认情况下允许并发
    // const shouldTimeSlice = !includesBlockingLane(root, lanes) && (!didTimeout);
    const shouldTimeSlice = nonIncludesBlockingLane && nonIncludesExpiredLane && nonTimeout;
    // console.log('判断是否需要时间分片', shouldTimeSlice)
    // >>>>>>>>> 并发渲染 <<<<<<<<<<<<<<
    const exitStatus = shouldTimeSlice ? renderRootConcurrent(root, lanes) : renderRootSync(root, lanes);
    // >>>>>>>>>> 更新渲染 <<<<<<<<<<<<<<
    // if (shouldTimeSlice) { // 并发渲染
    //     renderRootConcurrent(root, lanes)
    // } else { // 同步渲染
    //     renderRootSync(root, lanes);
    // }
    // >>>>>>>>>>>> 同步渲染 <<<<<<<<<
    // console.log("performConcurrentWorkOnRoot");
    // 初次渲染， 同步渲染根节点 第一次渲染 要尽快给用户看
    // renderRootSync(root)

    // 如果不是渲染中，则是渲染完成状态
    if (exitStatus !== RootInProgress) {
        const finishedWork = root.current.alternate;
        root.finishedWork = finishedWork;
        // printFiber(finishedWork);
        // printFinishedWork(finishedWork)
        commitRoot(root);
    }

    // 任务没完成，还在构建中， commit后 root.callbackNode = null
    if (root.callbackNode === originalCallbackNode) {
        return performConcurrentWorkOnRoot.bind(null, root);
    }

    return null;
}

// 构建过程中此方法会反复进来多次
function renderRootConcurrent(root, lanes) {
    // 根不一样或者lane不一样，创建新的fiber树
    // 只有第一次进来会创建新的根fiber
    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
        prepareFreshStack(root, lanes);
    }

    // 在当前分配的时间片内执行树的构建
    workLoopConcurrent(); // 并发工作循环

    // 构建没完成
    if (workInProgress !== null) {
        // 返回状态
        return RootInProgress;
    }

    // workInProgressRoot = null;
    // workInProgressRootRenderLanes = NoLanes;
    return workInProgressRootExitStatus;
}

function workLoopConcurrent() {
    while (workInProgress !== null && !shouldYield()) {
        sleep(6); // 睡6s
        performUnitOfWork(workInProgress); // 构建fiber
    }
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

    console.log('commit', finishedWork.child.memoizedState.memoizedState[0]);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 重置 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    workInProgress = null;
    workInProgressRootRenderLanes = NoLanes;
    root.callbackNode = null;
    root.callbackPriority = NoLane;

    const remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);
    markRootFinished(root, remainingLanes);

    // 判断是否有 effect 副作用
    if ((finishedWork.subtreeFlags & Passive) !== NoFlags || (finishedWork.flags & Passive) !== NoFlags) {
        if (!rootDoesHavePassiveEffects) {
            // 表示跟上有要执行的副作用
            rootDoesHavePassiveEffects = true;
            // 刷新 副作用 开启新的宏任务，等待赋值之后执行
            // scheduleCallback(flushPassiveEffects); 先new Task，返回 new Task
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

    ensureRootIsScheduled(root, now());
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
    return workInProgressRootExitStatus;
}

/**
 * 为根节点创建新的 Fiber 栈。
 * 基于 root.current（当前 Fiber 树）创建 workInProgress（正在构建的 Fiber 树）。
 * @param {*} root 
 */
function prepareFreshStack(root, lanes) {
    workInProgressRoot = root;
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

// 完成工作单元
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

    // 构建完毕设置构建状态
    if (workInProgressRootExitStatus === RootInProgress) {
        workInProgressRootExitStatus = RootCompleted;
    }

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

export function requestEventTime() {
    currentEventTime = now();
    return currentEventTime;
}

function sleep(time) {
    const timeStamp = new Date().getTime();
    const endTime = timeStamp + time;
    while (true) {
        if (new Date().getTime() > endTime) {
            return;
        }
    }
}