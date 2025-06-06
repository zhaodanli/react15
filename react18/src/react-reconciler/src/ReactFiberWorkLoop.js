import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork.js";

// 新的 待更新， 正在构建中的 fiber, 相对current 是老的节点 （展示，页面上真实dom, 已经渲染完成的fiber）
let workInProgress = null;

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
    scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 执行根节点上的并发更新任务。
 * 在初次渲染时，调用 renderRootSync 以同步方式渲染根节点，尽快将内容展示给用户
 * 在fiber上构建fiber树，把真实节点插入容器
 * @param {*} root 
 */
function performConcurrentWorkOnRoot(root) {
    console.log("performConcurrentWorkOnRoot");
    // 初次渲染， 同步渲染根节点 第一次渲染 要尽快给用户看
    renderRootSync(root)
}

/**
 * 构建新的 Fiber 树，并同步执行更新任务。
 * @param {*} root 
 */
function renderRootSync(root){
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
    console.log('workInProgress>>>>>>>>>>>', workInProgress);
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
function performUnitOfWork(unitOfWork){
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
        if(siblingFiber) {
            workInProgress = siblingFiber;
            return;
        }
        completedWork = returnFiber;
        workInProgress = completedWork;
    } while(completedWork !== null)
}