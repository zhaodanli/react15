import { createFiberRoot } from "./ReactFiberRoot.js";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue.js";
import { scheduleUpdateOnFiber, requestUpdateLane } from "./ReactFiberWorkLoop.js";

export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo);
}

export function updateContainer(element, container) {
  // 获取当前fiber
  const current = container.current;
  // 创建更新前，先请求一个更新车道
  const lane = requestUpdateLane(current);
  // 创建更新
  const update = createUpdate(lane);
  // 要更新的虚拟DOM
  update.payload = { element };
  // 将状态更新（update）插入到 Fiber 节点的更新队列中
  const root = enqueueUpdate(current, update, lane);
  // 在 fiber 上 调度更新 root
  scheduleUpdateOnFiber(root, current, lane)
}