import { markUpdateLaneFromFiberToRoot, enqueueConcurrentClassUpdate } from "./ReactFiberConcurrentUpdates";
import assign from "shared/assign";
import { mergeLanes, NoLanes, NoLane, isSubsetOfLanes } from './ReactFiberLane';

export const UpdateState = 0;

export function initializeUpdateQueue(fiber) {
    // pending 是 循环链表
    const queue = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: null,
        },
    };
    fiber.updateQueue = queue;
}

export function createUpdate(lane) {
    const update = { tag: UpdateState, lane, next: null };
    return update;
}


/** 将状态更新（update）插入到 Fiber 节点的更新队列中。
 * 它的作用是将新的更新对象添加到更新队列中，并返回从当前 Fiber 节点到根节点的路径，用于触发调度和渲染。
 * */
export function enqueueUpdate(fiber, update, lane) {
    const updateQueue = fiber.updateQueue; // 获取更新队列
    const sharedQueue = updateQueue.shared; // 获取共享队列
    // 该用并发方式写
    return enqueueConcurrentClassUpdate(fiber, sharedQueue, update, lane);
    // const pending = sharedQueue.pending;
    // if (pending === null) {
    //     update.next = update;
    // } else {
    //     update.next = pending.next;
    //     pending.next = update
    // }
    // updateQueue.shared.pending = update;
    // // 返回根节点路径
    // return markUpdateLaneFromFiberToRoot(fiber);
}

/** 主要作用是依次处理所有待更新的 state，并计算出最终的新状态。
 * 类组件 setState 更新队列的处理核心，
 * 从虚拟DOM 拿取 状态 到 memoizedState
 * @param {当前正在处理的 Fiber 节点} workInProgress 
 */
export function processUpdateQueue(workInProgress, props, workInProgressRootRenderLanes) {
    // 获取新的更新队列
    const queue = workInProgress.updateQueue
    // 第一个跳过的更新
    let firstBaseUpdate = queue.firstBaseUpdate;
    // 最后一个跳过的更新
    let lastBaseUpdate = queue.lastBaseUpdate;
    // 获取待生效的队列
    const pendingQueue = queue.shared.pending
    /**   如果有新链表合并新旧链表开始  */
    // 如果有新的待生效的队列
    if (pendingQueue !== null) {
        // 先清空待生效的队列
        queue.shared.pending = null
        // 最后一个待生效的更新
        const lastPendingUpdate = pendingQueue
        // 第一个待生效的更新
        const firstPendingUpdate = lastPendingUpdate.next
        // 把环状链表剪开
        lastPendingUpdate.next = null
        // 如果没有老的更新队列
        if (lastBaseUpdate === null) {
            // 第一个基本更新就是待生效队列的第一个更新
            firstBaseUpdate = firstPendingUpdate;
        } else {
            // 否则把待生效更新队列添加到基本更新的尾部
            lastBaseUpdate.next = firstPendingUpdate;
        }
        // 最后一个基本更新肯定就是最后一个待生效的更新
        lastBaseUpdate = lastPendingUpdate;
        /**  合并新旧链表结束  */
    }

    // 如果有更新
    if (firstBaseUpdate !== null) {
        // 基本状态
        let newState = queue.baseState;
        // 新的车道
        let newLanes = NoLanes;
        // 新的基本状态
        let newBaseState = null;
        // 新的第一个基本更新
        let newFirstBaseUpdate = null;
        // 新的最后一个基本更新 
        let newLastBaseUpdate = null;
        // 第一个更新
        let update = firstBaseUpdate;
        do {
            const updateLane = update.lane;
            const shouldSkipUpdate = !isSubsetOfLanes(workInProgressRootRenderLanes, updateLane);
            // 判断优先级是否足够,如果不够就跳过此更新 
            if (shouldSkipUpdate) {
                // 复制一个新的更新并添加新的基本链表中
                const clone = {
                    lane: updateLane,
                    tag: update.tag,
                    payload: update.payload,
                    next: null
                };
                if (newLastBaseUpdate === null) {
                    newFirstBaseUpdate = newLastBaseUpdate = clone;
                    newBaseState = newState;
                } else {
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                // 保存此fiber上还剩下的更新车道
                newLanes = mergeLanes(newLanes, updateLane);
            } else {
                // 如果已经有跳过的更新了，即使优先级足够也需要添到新的基本链表中
                if (newLastBaseUpdate !== null) {
                    const clone = {
                        lane: NoLane,
                        tag: update.tag,
                        payload: update.payload,
                        next: null
                    };
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                // 根据更新计算新状态
                newState = getStateFromUpdate(update, newState, props);
                update = update.next;
            }
        } while (update);
        // 如果没有跳过的更新
        if (newLastBaseUpdate === null) {
            newBaseState = newState;
        }
        queue.baseState = newBaseState;
        queue.firstBaseUpdate = newFirstBaseUpdate;
        queue.lastBaseUpdate = newLastBaseUpdate;
        workInProgress.lanes = newLanes;
        workInProgress.memoizedState = newState;
    }

    // // 更新队列存储了所有待处理的状态更新。
    // const queue = workInProgress.updateQueue;
    // const pendingQueue = queue.shared.pending;
    // if (pendingQueue !== null) {
    //     // 清空更新队列 表示更新队列已被提取，防止重复处理
    //     queue.shared.pending = null;
    //     const lastPendingUpdate = pendingQueue;
    //     const firstPendingUpdate = lastPendingUpdate.next;
    //     // 断开循环链表
    //     lastPendingUpdate.next = null;
    //     // 初始化新状态
    //     let newState = workInProgress.memoizedState;
    //     let update = firstPendingUpdate;
    //     while (update) {
    //         // update 当前正在处理的更新对象。 计算新状态 newState 为老状态
    //         newState = getStateFromUpdate(update, newState);
    //         update = update.next;
    //     }
    //     // 将新状态保存至 memoizedState 保存最终状态
    //     workInProgress.memoizedState = newState;
    // }
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
            let partialState;
            if (typeof payload === 'function') {
                partialState = payload.call(null, prevState, nextProps);
            } else {
                partialState = payload;
            }

            // const partialState = payload;
            return assign({}, prevState, partialState);
        }
        default:
            return prevState;
    }
}

export function cloneUpdateQueue(current, workInProgress) {
    // 拿到新队列和老队列
    const queue = workInProgress.updateQueue;
    const currentQueue = current.updateQueue;
    // 一样的话就克隆一份
    if (queue === currentQueue) {
        const clone = {
            baseState: currentQueue.baseState,
            firstBaseUpdate: currentQueue.firstBaseUpdate,
            lastBaseUpdate: currentQueue.lastBaseUpdate,
            shared: currentQueue.shared,
        };
        workInProgress.updateQueue = clone;
    }
}