import { createContainer, updateContainer } from "react-reconciler/src/ReactFiberReconciler.js";

function ReactDOMRoot(internalRoot) {
    // 初始化 Fiber 树的容器（internalRoot）
    this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function render(children) {
    const root = this._internalRoot;
    root.containerInfo.innerHTML = "";
    // 用于将 React 的虚拟 DOM（children）更新到指定的 Fiber 树（root）中，并触发渲染流程。
    updateContainer(children, root);
};
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