import { setInitialProperties } from "./ReactDOMComponent";

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