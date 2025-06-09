import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

/** 根据 Fiber 实例和事件名，获取当前 DOM 节点上最新的事件处理函数（listener）。
 * 渲染时，React 会通过 updateFiberProps 把 { onClick: handleClick } 存到 button 的 DOM 节点上。
 * 假设 inst 是 button 对应的 Fiber 节点，registrationName 是 "onClick"
 * inst.stateNode 就是 button 的 DOM 节点。
 * getFiberCurrentPropsFromNode(stateNode) 会拿到 { onClick: handleClick }。
 * props[registrationName] 就是 props["onClick"]，也就是 handleClick 这个函数。
 */
export default function getListener(inst, registrationName) {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName];
  return listener;
}