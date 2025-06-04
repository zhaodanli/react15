/**
 * 这段代码模拟了 React 内部的 更新队列（Update Queue） 的工作机制，主要用于管理组件的状态更新。
 * React 的状态更新机制
 * 更新队列：使用循环链表存储多个更新。
 * 合并状态：通过遍历更新队列，依次计算新状态。
 * 最终状态：将所有更新合并到 fiber.memoizedState 中。
 * 这种机制保证了 React 的状态更新是批量处理的，并且可以按顺序合并多个更新。
 */

/**
 * 1. 核心概念
        fiber: React 中的 Fiber 是一个数据结构，表示组件的工作单元。这里的 fiber 对象包含了 memoizedState（当前状态）和 updateQueue（更新队列）。
        updateQueue: 用于存储状态更新的队列。它是一个循环链表，存储所有的更新。
        update: 表示一个状态更新的对象，包含更新的类型（tag）和更新的数据（payload）。
    2. 代码分解与解释
初始化更新队列

 */
const UpdateState = 0;

/**
 * 初始化更新队列
 * @param {*} fiber 
 * 每个 fiber 都有一个 updateQueue，用于存储状态更新。
 * shared.pending 是一个循环链表，存储所有待处理的更新。
 */
function initializeUpdateQueue(fiber) {
    // queue 代表更新队列
    const queue = {
        shared: {
            pending: null, // 初始时没有任何更新
        },
    };
    // updateQueue: 用于存储状态更新的队列。它是一个循环链表，存储所有的更新。
    fiber.updateQueue = queue; // 将更新队列挂载到 fiber 上
}

/**
 * 创建更新
 * @returns 创建更新
 * 每次调用 createUpdate，都会创建一个新的更新对象。
 * tag 表示更新的类型，这里只有一种类型 UpdateState。
 */
function createUpdate() {
    // update: 表示一个状态更新的对象，包含更新的类型（tag）和更新的数据（payload）。
    const update = { tag: UpdateState };  // 创建一个更新对象，类型为 UpdateState
    return update;
}

/**
 * 将更新加入队列
 * @param {*} fiber  Fiber 是一个数据结构，表示组件的工作单元。 这里的 fiber 对象包含了 memoizedState（当前状态）和 updateQueue（更新队列）。
 * @param {*} update 
 * 更新队列是一个循环链表：
 * 如果队列为空，update 自己指向自己。
 * 如果队列不为空，将 update 插入到链表中，形成一个循环结构。
 */
function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;  // 获取当前队列的最后一个更新
    if (pending === null) {
        // 如果队列为空，将当前更新形成一个循环链表
        update.next = update;
    } else {
        // 如果队列不为空，将当前更新插入到链表中
        update.next = pending.next;
        pending.next = update;
    }
    updateQueue.shared.pending = update; // 更新队列的最后一个更新
}

/**
 * 处理更新队列
 * @param {*} workInProgress 
 * 获取更新队列的最后一个更新。
 * 将循环链表打破，变成普通链表。
 * 遍历链表，依次处理每个更新，计算新的状态。
 * 将计算后的新状态赋值给 fiber.memoizedState
 */
function processUpdateQueue(workInProgress) {
    const queue = workInProgress.updateQueue;
    const pendingQueue = queue.shared.pending; // 获取最后一个更新
    if (pendingQueue !== null) {
        queue.shared.pending = null; // 清空队列
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = lastPendingUpdate.next; // 获取第一个更新
        lastPendingUpdate.next = null; // 打破循环链表
        let newState = workInProgress.memoizedState; // 获取当前状态
        let update = firstPendingUpdate;
        while (update) {
            // 遍历更新队列，计算新状态
            newState = getStateFromUpdate(update, newState);
            update = update.next;
        }

        // 更新 fiber 的状态
        workInProgress.memoizedState = newState;
    }
}

/**
 * 根据更新计算新状态
 * @param {*} update 
 * @param {*} prevState 
 * @returns 
 * 根据 update.tag 判断更新类型，这里只有 UpdateState 类型。
 * 将 update.payload（部分状态）与 prevState 合并，生成新的状态。
 */
function getStateFromUpdate(update, prevState) {
    switch (update.tag) {
        case UpdateState: {
            const { payload } = update; // 获取更新的数据
            const partialState = payload; // 假设 payload 是部分状态
            return Object.assign({}, prevState, partialState); // 合并状态
        }
        default:
            return prevState;
    }
}

/**
 * 遍历更新队列，依次处理 update1 和 update2：
 * 初始状态：{ id: 1 }
 * 处理 update1：合并 { name: "zhufeng" }，状态变为 { id: 1, name: "zhufeng" }
 * 处理 update2：合并 { age: 14 }，状态变为 { id: 1, name: "zhufeng", age: 14 }
 * 最终 fiber.memoizedState 为：
 * { id: 1, name: "zhufeng", age: 14 }
 */
// 初始化 Fiber
let fiber = { memoizedState: { id: 1 } }; // 初始状态为 { id: 1 }
initializeUpdateQueue(fiber); // 初始化更新队列
// 创建并加入更新
let update1 = createUpdate();
update1.payload = { name: "zhufeng" };  // 更新1：添加 name 属性
enqueueUpdate(fiber, update1);

let update2 = createUpdate();
update2.payload = { age: 14 }; // 更新2：添加 age 属性
enqueueUpdate(fiber, update2);

/** >>>>>>>>>>>>>>>>>>> update1 和 update2 被加入到 fiber.updateQueue 的循环链表中。 >>>> */

// 处理更新队列
processUpdateQueue(fiber);
console.log(fiber);