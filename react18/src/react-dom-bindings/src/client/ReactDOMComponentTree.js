const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;
const internalPropsKey = "__reactProps$" + randomKey;

/** 通过 DOM 节点获取其上挂载的 Fiber 实例。
 * 事件冒泡时，可以通过事件 target 快速找到对应的 Fiber 节点
 * @param {*} targetNode 
 * @returns 
 */
export function getClosestInstanceFromNode(targetNode) {
  const targetInst = targetNode[internalInstanceKey];
  if (targetInst) {
    return targetInst;
  }
  return null;
}


/** 通过 DOM 节点获取其上挂载的最新 props。
 * 事件系统可以用它拿到事件处理函数等。
 * @param {*} node 
 * @returns 
 */
export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}

/** 在 DOM 节点上提前存储对应的 Fiber 实例。
 * 渲染时调用，为事件系统做准备。
 * @param {*} hostInst 
 * @param {*} node 
 */
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}

/** 在 DOM 节点上存储最新的 props。
 * 每次 props 变化时调用，保证事件处理函数等是最新的。
 * @param {*} node 
 * @param {*} props 
 */
export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}