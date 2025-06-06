import { createFiberRoot } from "./ReactFiberRoot.js";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue.js";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop.js";

export function createContainer(containerInfo) {
  return createFiberRoot(containerInfo);
}

export function updateContainer(element, container) {
  // 获取当前fiber
  const current = container.current;
  // 创建更新
  const update = createUpdate();
  // 要更新的虚拟DOM
  update.payload = { element };
  // 将状态更新（update）插入到 Fiber 节点的更新队列中
  const root = enqueueUpdate(current, update);
  // 在 fiber 上 调度更新 root
  scheduleUpdateOnFiber(root)
}