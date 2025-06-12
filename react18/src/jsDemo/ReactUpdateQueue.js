const { NoLane, NoLanes, isSubsetOfLanes, mergeLanes } = require('./ReactFiberLane');

// 初始化队列
function initializeUpdateQueue(fiber) {
    const queue = {
        // 本次更新前 该Fiber节点的state, Update基于该state计算更新后的state
        // state 不是每次都等于最新的 state，而是**“下次需要继续处理的 base update 链表的起点 state
        // fiber.memoizedState：才是本次渲染后最新的 state。
        // 这样下次如果有更高优先级的 renderLanes（比如 0b10），就可以从 {number: 1} 开始，继续处理 updateB，不会丢失之前的结果，也不会重复处理已完成的 update。
        baseState: fiber.memoizedState, // 上一次计算后的
        // 基础更新链表（未被跳过的 update）
        firstBaseUpdate: null, // 本次更新前该Fiber节点已保存的Update链表头
        lastBaseUpdate: null, // 本次更新前该Fiber节点已保存的Update链表尾
        // 新进来的 update，形成单向环状链表，等待合并进 base 队列
        shared: {
            // 触发更新时，产生的Update会保存在shared.pending中形成单向环状链表
            // 当由Update计算state时这个环会被剪开并连接在lastBaseUpdate后面
            pending: null
        }
    }
    fiber.updateQueue = queue;
}

// 入队更新 
// 新的 update 会被加入 shared.pending，形成环状链表。
// 这样可以高效地批量合并多次 setState。
function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    if (updateQueue === null) {
        return;
    }
    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;
    if (pending === null) {
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    sharedQueue.pending = update;
}

/**
 * 处理更新队列
 * @param {*} fiber 
 * @param {*} renderLanes 
 */
function processUpdateQueue(fiber, renderLanes) {
    // 获取此fiber上的更新队列
    const queue = fiber.updateQueue;
    // 获取第一个更新
    let firstBaseUpdate = queue.firstBaseUpdate;
    let lastBaseUpdate = queue.lastBaseUpdate;
    // 判断一下是否在等待生效的的更新，如果有，变成base队列
    let pendingQueue = queue.shared.pending;

    /** demo:
        * 初始状态: base 队列为空（firstBaseUpdate = null，lastBaseUpdate = null
            * pending 队列为环状链表：updateC -> updateA -> updateB -> updateC (回到头)
            * 取出 pending 队列的最后一个节点 lastPendingUpdate = updateC
            * 找到第一个节点 firstPendingUpdate = updateC.next = updateA
        * 合并步骤
            * 取出 pending 队列的最后一个节点 lastPendingUpdate = updateC
            * 找到第一个节点 firstPendingUpdate = updateA
            * 断开环：lastPendingUpdate.next = null，现在 pending 变成普通链表：updateA -> updateB -> updateC
            * 如果 base 队列为空，firstBaseUpdate = firstPendingUpdate 即 firstBaseUpdate = updateA
                * lastBaseUpdate = lastPendingUpdate，即 lastBaseUpdate = updateC
            * 此时，所有 update 都在 base 队列里，顺序是：
                * firstBaseUpdate: updateA -> updateB -> updateC
     *  */ 

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 合并 pending 队列到 base 队列 <<<<<<<<<<<<<<<<<<<<<<<<<<,

    // 如果有 shared.pending，把它剪成普通链表，接到 base 队列尾部。 这样所有待处理的 update 都在 base 队列里。
    if (pendingQueue !== null) {
        // 等待生效的队列是循环队列
        queue.shared.pending = null;
        // 最后一个等待的更新 取出 pending 队列的最后一个节点 lastPendingUpdate = updateC
        const lastPendingUpdate = pendingQueue;
        // 第一个等待的更新 找到第一个节点 firstPendingUpdate = updateC.next = updateA
        const firstPendingUpdate = lastPendingUpdate.next;
        // 把环剪断，最后一个不再指向第一个 现在 pending 变成普通链表：updateA -> updateB -> updateC
        lastPendingUpdate.next = null;
        // 把等待生效的队列添加到base队列中
        // 如果base队列为空
        if (lastBaseUpdate === null) {
            firstBaseUpdate = firstPendingUpdate;
        } else {// 否则就把当前的更新队列添加到base队列的尾部
            lastBaseUpdate.next = firstPendingUpdate;
        }
        // 尾部也接上
        lastBaseUpdate = lastPendingUpdate;
    }


    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 遍历 base 队列，按优先级处理 <<<<<<<<<<<<<<<<<<<<<<<<<<,

    /** 假设场景
     * 当前组件 state 初始值为 {number: 0}
     * 有 3 个 update（假设都已合并到 base 队列）：
        * updateA：lane = 0b01，payload: state => ({number: state.number + 1})
        * updateB：lane = 0b10，payload: state => ({number: state.number + 10})
        * updateC：lane = 0b01，payload: state => ({number: state.number + 100})
     * 本次渲染 renderLanes = 0b01（只处理 lane=0b01 的 update）
     * 初始状态
        * newState = {number: 0}
        * newLanes = 0b00
        * newBaseState = null
        * newFirstBaseUpdate = null
        * newLastBaseUpdate = null
        * update = updateA
    * 遍历 updateA（lane=0b01）
        * isSubsetOfLanes(0b01, 0b01) → true，优先级够
        * newState = getStateFromUpdate(updateA, {number: 0}) → {number: 1}
    * 遍历 updateB（lane=0b10）
        * isSubsetOfLanes(0b01, 0b10) → false，优先级不够，跳过
        * 克隆 updateB，加入新的 base 队列
        * newFirstBaseUpdate = newLastBaseUpdate = clone(updateB)
        * newBaseState = {number: 1}
        * newLanes = mergeLanes(0b00, 0b10) = 0b10
    * 遍历 遍历 updateC（lane=0b01）
        * isSubsetOfLanes(0b01, 0b01) → true，优先级够
        * 之前有跳过的 update，所以也克隆 updateC（lane 设为 NoLane），追加到新 base 队列
        * newState = getStateFromUpdate(updateC, {number: 1}) → {number: 101}
    * 遍历结束，更新队列和状态
        * newBaseState = {number: 1}（因为有跳过的 update）
        * queue.baseState = {number: 1}
        * queue.firstBaseUpdate = newFirstBaseUpdate（即 clone(updateB)）
        * queue.lastBaseUpdate = newLastBaseUpdate（即 clone(updateC)）
        * fiber.lanes = 0b10（还有未处理的 lane）
        * fiber.memoizedState = {number: 101}
     */
    // 开始计算新的状态
    if (firstBaseUpdate !== null) {
        // 先获取老的值{number:0}
        let newState = queue.baseState;
        let newLanes = NoLanes;
        let newBaseState = null; // 新的基础状态
        let newFirstBaseUpdate = null; // 第一个跳过的更新
        let newLastBaseUpdate = null; // 新的最后一个基本更新
        let update = firstBaseUpdate; // 指向第一个更新

        // 遍历每个 update，判断其 lane 是否被本次渲染的 renderLanes 覆盖。
        do {
            // 获取更新车道
            const updateLane = update.lane;
            // 如果优先级不够，跳过这个更新，如果这是第一个跳过的更新，上一个状态和更新成为newBaseState和newFirstBaseUpdate
            if (!isSubsetOfLanes(renderLanes, updateLane)) {
                const clone = {
                    id: update.id,
                    lane: updateLane,
                    payload: update.payload
                };
                if (newLastBaseUpdate === null) {
                    newFirstBaseUpdate = newLastBaseUpdate = clone; //  first=last=update1
                    newBaseState = newState; // 0
                } else {
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                // 更新队列中的剩下的优先级
                newLanes = mergeLanes(newLanes, updateLane);
            } else {
                // 如果有足够的优先级 如果有曾经跳过的更新，仍然追加在后面
                if (newLastBaseUpdate !== null) {
                    const clone = {
                        id: update.id,
                        // NoLane是所有的优先级的子集，永远不会被跳过
                        lane: NoLane,
                        payload: update.payload
                    };
                    newLastBaseUpdate = newLastBaseUpdate.next = clone;
                }
                newState = getStateFromUpdate(update, newState);
            }
            update = update.next;
            if (!update) {
                break;
            }
        } while (true);

        if (!newLastBaseUpdate) {
            newBaseState = newState;
        }
        queue.baseState = newBaseState;
        queue.firstBaseUpdate = newFirstBaseUpdate;
        queue.lastBaseUpdate = newLastBaseUpdate;
        fiber.lanes = newLanes;
        fiber.memoizedState = newState;
    }
}

// 遍历更新队列，计算状态
function getStateFromUpdate(update, prevState) {
  const payload = update.payload;
  let partialState = payload(prevState);
  return Object.assign({}, prevState, partialState);
}

module.exports = {
  initializeUpdateQueue,
  enqueueUpdate,
  processUpdateQueue
}