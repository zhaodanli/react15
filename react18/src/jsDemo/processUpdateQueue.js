const { initializeUpdateQueue, enqueueUpdate, processUpdateQueue } = require('./ReactUpdateQueue');
const { SyncBatchedLane, SyncLane } = require('./ReactFiberLane');

//初始化fiber节点
let fiber = { memoizedState: { msg: '' } };
initializeUpdateQueue(fiber);
let update1 = { id: 'A', payload: (state) => ({ msg: state.msg + 'A' }), lane: SyncBatchedLane };
enqueueUpdate(fiber, update1);
let update2 = { id: 'B', payload: (state) => ({ msg: state.msg + 'B' }), lane: SyncLane };
enqueueUpdate(fiber, update2);
let update3 = { id: 'C', payload: (state) => ({ msg: state.msg + 'C' }), lane: SyncBatchedLane };
enqueueUpdate(fiber, update3);
let update4 = { id: 'D', payload: (state) => ({ msg: state.msg + 'D' }), lane: SyncLane };
enqueueUpdate(fiber, update4);

//以同步的优先级进行更新
processUpdateQueue(fiber, SyncLane);
console.log('memoizedState', fiber.memoizedState);
console.log('updateQueue', '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', printQueue(fiber.updateQueue));

let update5 = { id: 'E', payload: (state) => ({ msg: state.msg + 'E' }), lane: SyncLane };
enqueueUpdate(fiber, update5);
processUpdateQueue(fiber, SyncLane);
console.log('memoizedState', fiber.memoizedState);
console.log('updateQueue', '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', printQueue(fiber.updateQueue));

processUpdateQueue(fiber, SyncBatchedLane);
console.log('memoizedState', fiber.memoizedState);
console.log('updateQueue', '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', printQueue(fiber.updateQueue));

let update6 = { id: 'F', payload: (state) => ({ msg: state.msg + 'F' }), lane: SyncBatchedLane };
enqueueUpdate(fiber, update6);
processUpdateQueue(fiber, SyncLane);
console.log('memoizedState', fiber.memoizedState);
console.log('updateQueue', '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', printQueue(fiber.updateQueue));


function printQueue(queue) {
  const { baseState, firstBaseUpdate } = queue
  let state = baseState.msg + '|';
  let update = firstBaseUpdate;
  console.log('baseState', baseState)
  while (update) {
    state += ((update.id) + "=>");
    update = update.next;
  }
  state += "null";
  console.log(state);
}