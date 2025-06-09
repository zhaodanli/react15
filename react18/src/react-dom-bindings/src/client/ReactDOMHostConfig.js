import { setInitialProperties } from "./ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree.js";

export function shouldSetTextContent(type, props) {
    return typeof props.children === "string" || typeof props.children === "number";
}

/** 添加节点
 * 
 * @param {*} parent 
 * @param {*} child 
 */
export const appendInitialChild = (parent, child) => {
    parent.appendChild(child);
}

/** 创建标签节点
 * @param {*} type 
 * @param {*} props 
 * @param {*} internalInstanceHandle 
 * @returns 
 */
export const createInstance = (type, props, internalInstanceHandle) => {
    const domElement = document.createElement(type);
    // 存储 fiber 到 target 上
    precacheFiberNode(internalInstanceHandle, domElement);
    // 把当前 DOM 元素（domElement）对应的最新 props 存储到这个 DOM 节点上，供事件系统等后续使用。
    // 在 React 渲染过程中，每个 DOM 元素都可能有事件处理函数等 props。
    // React 事件系统需要在事件触发时，能够通过原生 DOM 节点快速拿到最新的 props（比如 onClick）。
    // updateFiberProps 就是把这些 props 存到 DOM 节点的一个专用属性上（如 __reactProps$xxxx）。
    // 这样，事件系统在事件冒泡时可以通过 event.target 直接拿到对应的 props，保证事件处理函数总是最新的。
    //  让 DOM 节点和最新的 props 建立关联，保证事件系统能正确、高效地找到事件处理函数等信息。
    updateFiberProps(domElement, props);
    return domElement;
}

/** 创建文本节点
 * @param {*} content 
 * @returns 
 */
export const createTextInstance = (content) => document.createTextNode(content);

/** 设置节点属性
 * @param {*} domElement 
 * @param {*} type 
 * @param {*} props 
 */
export function finalizeInitialChildren(domElement, type, props) {
    setInitialProperties(domElement, type, props);
}

export function appendChild(parentInstance, child) {
    parentInstance.appendChild(child);
}
export function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
}