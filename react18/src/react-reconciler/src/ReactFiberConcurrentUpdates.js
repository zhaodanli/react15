import { HostRoot } from "./ReactWorkTags";


/**
 * 并发队列结构
 * 用数组存储所有待处理的 Fiber、队列和更新对象，按顺序排列
 * 负责收集、管理和批量处理并发模式下的 Hook 更新，保证多次 setState 能被批量合并和高效调度。
 * 通过数组和循环链表结构，实现了高效的批量入队和出队。
 */
const concurrentQueues = [];
let concurrentQueuesIndex = 0;


/**
 * 这个文件实现了 React Fiber 的并发更新队列管理，主要用于支持并发模式下的 Hook 更新（如 useState、useReducer），保证多次更新能被批量收集和统一处理。
 */
/** 入口函数，把一次 Hook 更新（如 setState）加入并发队列，并返回根节点（HostRoot）。
 * @param {*} fiber 
 * @param {*} queue 
 * @param {*} update 
 * @returns 
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update) {
  // 把一次 Hook 更新（如 setState）加入并发队列
  enqueueUpdate(fiber, queue, update);
  // 返回根节点（HostRoot）
  return getRootForUpdatedFiber(fiber);
}

/** 把 fiber、更新队列和更新对象依次存入数组。 */
function enqueueUpdate(fiber, queue, update) {
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
}

/** 查找根节点*/
function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    return node.stateNode;
  }
  return null;
}

/** 批量处理队列
 * 在调度阶段调用，把所有入队的更新应用到对应的 Fiber 的更新队列上（形成循环链表）。
 * 这样可以保证所有批量的 Hook 更新能被统一处理。
 * 将之前入队的更新应用到对应的 Fiber 上。
 * 这个函数会将入队的 Fiber、更新队列和更新操作从 concurrentQueues 中取出，
 * 并将更新操作添加到对应的 Fiber 的更新队列中。
 * @returns
 * @private
 */
export function finishQueueingConcurrentUpdates() {
  // 确定队列范围
  const endIndex = concurrentQueuesIndex;
  // 记录当前队列的长度，并重置索引，准备下次入队。
  concurrentQueuesIndex = 0;
  let i = 0;
  // 遍历并处理所有入队的更新
  while (i < endIndex) {
    const fiber = concurrentQueues[i++];
    const queue = concurrentQueues[i++];
    const update = concurrentQueues[i++];

    // 将更新加入到对应的更新队列（形成循环链表）
    if (queue !== null && update !== null) {
      // enqueueUpdate(fiber, queue, update);
      // 拿到 pending
      const pending = queue.pending;
      if (pending === null) { // 第一个更新，形成自环
        // queue.pending = update;
        update.next = update; // 循环链表
      } else { // 如果 pending 不为空，说明已经有更新存在
        // const last = pending;
        // last.next = update;
        update.next = queue.pending; // 循环链表
        pending.next = update; // 循环链表
      }
    }
  }
}

export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber;
  let parent = sourceFiber.return;
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  if (node.tag === HostRoot) {
    const root = node.stateNode;
    return root;
  }
  return null;
}