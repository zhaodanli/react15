import { createFiberRoot } from "./ReactFiberRoot";
import { createUpdate, enqueueUpdate } from "./ReactFiberClassUpdateQueue";

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
  // 把更新对象添加到更新队列上，返回根节点
  const root = enqueueUpdate(current, update);
  console.log(root);
}