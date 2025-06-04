import { markUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates";
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

// 插入队列
export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
        update.next = update;
    }else {
        update.next = pending.next;
        pending.next = update
    }
    updateQueue.shared.pending = update;
    return markUpdateLaneFromFiberToRoot(fiber);
}