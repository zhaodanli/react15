import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber.js";
import { beginWork } from "./ReactFiberBeginWork.js";
import { completeWork } from "./ReactFiberCompleteWork.js";
import { commitMutationEffectsOnFiber, commitMutationEffects, commitPassiveUnmountEffects, commitPassiveMountEffects, commitLayoutEffects } from "./ReactFiberCommitWork.js";
import { MutationMask, NoFlags, Placement, Update, ChildDeletion, Passive } from "./ReactFiberFlags.js";
import { HostRoot, HostComponent, HostText, FunctionComponent } from "./ReactWorkTags.js";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";
import { NormalPriority as NormalSchedulerPriority, scheduleCallback as Scheduler_scheduleCallback } from "./Scheduler";

// 新的 待更新， 正在构建中的 fiber, 相对current 是老的节点 （展示，页面上真实dom, 已经渲染完成的fiber）
let workInProgress = null;
let workInProgressRoot = null;

let rootDoesHavePassiveEffects = false; // 此根节点有没有副作用
let rootWithPendingPassiveEffects = null; // 有 effct 副作用 的根节点， 根fiber 的 stateNode

/**
 * 用于调度更新
 * @param {} root 
 */
export function scheduleUpdateOnFiber(root) {
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
    // if (workInProgressRoot) return;
    // workInProgressRoot = root;
    // scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));

    // NormalSchedulerPriority 优先级
    Scheduler_scheduleCallback(NormalSchedulerPriority, performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 执行根节点上的并发更新任务。
 * 在初次渲染时，调用 renderRootSync 以同步方式渲染根节点，尽快将内容展示给用户
 * 在fiber上构建fiber树，把真实节点插入容器
 * @param {*} root 
 */
function performConcurrentWorkOnRoot(root) {
    // console.log("performConcurrentWorkOnRoot");
    // 初次渲染， 同步渲染根节点 第一次渲染 要尽快给用户看
    renderRootSync(root)
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    printFiber(finishedWork);
    printFinishedWork(finishedWork)
    commitRoot(root);
    workInProgressRoot = null;
}

function commitRoot(root) {
    const { finishedWork } = root;
    
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
    if((flags & ChildDeletion) !== NoFlags) {
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

    if(fiber.flags === NoFlags) {
        console.log(
            getFlags(fiber), 
            getTag(fiber.tag), 
            typeof fiber.type === 'function'? fiber.type.name: type,
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
function renderRootSync(root) {
    // 为根节点创建新的 Fiber 栈 创建新的HOSTRootFiber === workInProgress（正在构建的
    prepareFreshStack(root);
    // 遍历 workInProgress 树，依次执行每个 Fiber 节点的更新任务。同步工作循环 
    workLoopSync();
}

/**
 * 为根节点创建新的 Fiber 栈。
 * 基于 root.current（当前 Fiber 树）创建 workInProgress（正在构建的 Fiber 树）。
 * @param {*} root 
 */
function prepareFreshStack(root) {
    // 创建新的HOSTRootFiber
    workInProgress = createWorkInProgress(root.current, null);
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
    const next = beginWork(current, unitOfWork);
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