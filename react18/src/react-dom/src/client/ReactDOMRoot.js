import { createContainer } from "react-reconciler/src/ReactFiberReconciler";

function ReactDOMRoot(internalRoot) {
    // 初始化 Fiber 树的容器（internalRoot）
    this._internalRoot = internalRoot;
}


/**
 * 创建 React 应用的根节点（ReactDOMRoot），
 * 并初始化 Fiber 树的容器（internalRoot）
 * @param {*} container 
 * @returns 
 */
export function createRoot(container) {
    // 创建 React 应用的根节点（ReactDOMRoot）
    const root = createContainer(container);
    return new ReactDOMRoot(root);
}