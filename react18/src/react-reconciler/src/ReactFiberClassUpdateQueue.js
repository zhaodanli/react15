import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";
import assign from "shared/assign";
export const UpdateState = 0;

export function initializeUpdateQueue(fiber) {
    // pending 是 循环链表
    const queue = {
        shared: {
            pending: null,
        },
    };
    fiber.updateQueue = queue;
}

// 创建更新
export function createUpdate() {
    const update = { tag: UpdateState };
    return update;
}

/** 将状态更新（update）插入到 Fiber 节点的更新队列中。
 * 它的作用是将新的更新对象添加到更新队列中，并返回从当前 Fiber 节点到根节点的路径，用于触发调度和渲染。
 * */
export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update
    }
    updateQueue.shared.pending = update;
    // 返回根节点路径
    return markUpdateLaneFromFiberToRoot(fiber);
}

/**
 * 从虚拟DOM 拿取 状态 到 memoizedState
 * @param {当前正在处理的 Fiber 节点} workInProgress 
 */
export function processUpdateQueue(workInProgress) {
    // 更新队列存储了所有待处理的状态更新。
    const queue = workInProgress.updateQueue;
    const pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
        // 清空更新队列 表示更新队列已被提取，防止重复处理
        queue.shared.pending = null;
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = lastPendingUpdate.next;
        // 断开循环链表
        lastPendingUpdate.next = null;
        // 初始化新状态
        let newState = workInProgress.memoizedState;
        let update = firstPendingUpdate;
        while (update) {
            // update 当前正在处理的更新对象。 计算新状态 newState 为老状态
            newState = getStateFromUpdate(update, newState);
            update = update.next;
        }
        // 将新状态保存至 memoizedState 保存最终状态
        workInProgress.memoizedState = newState;
    }
}

/**
 * 根据更新对象（update）和当前状态（prevState），计算新的状态
 * @param {*} update 
 * @param {*} prevState 
 * @returns 
 */
function getStateFromUpdate(update, prevState) {
    switch (update.tag) {
        case UpdateState: {
            const { payload } = update;
            const partialState = payload;
            return assign({}, prevState, partialState);
        }
        default:
            return prevState;
    }
}