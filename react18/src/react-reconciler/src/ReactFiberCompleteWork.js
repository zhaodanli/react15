import {
    appendInitialChild,
    createInstance,
    createTextInstance,
    finalizeInitialChildren,
} from "react-dom-bindings/src/client/ReactDOMHostConfig.js";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags.js";
import { NoFlags } from "./ReactFiberFlags.js";
import logger, { indent } from "shared/logger.js";

/**
 * 这个文件实现了 React Fiber 架构中completeWork 阶段的核心逻辑，是 React 渲染流程的关键部分
 * 完成当前 Fiber 节点的“收尾”工作，包括创建 DOM 实例、递归挂载子节点、初始化属性、冒泡副作用标记等。
 * 这是 React 渲染流程中“构建真实 DOM 树”的关键步骤，为后续的提交（commit）阶段做准备
 */

/**
 * 代码的工作流程 
 * 调用 completeWork：根据 Fiber 节点的类型执行不同的处理逻辑。
 * 处理 HostComponent：创建 DOM 实例，附加子节点，初始化属性，冒泡副作用。
 * 处理 HostRoot：冒泡子树的副作用。
 * 处理 HostText：创建文本节点，冒泡副作用。
 * 冒泡副作用：将子节点的副作用标记冒泡到父节点。
 * 附加子节点：将当前节点的所有子节点递归附加到父节点。
 */

/** 将所有子节点的副作用标记（flags）冒泡到父节点，便于提交阶段统一处理。
 * 遍历所有子节点，把它们的 flags 合并到当前节点的 subtreeFlags 上。
 * 冒泡子树的副作用
 * @param {*} completedWork 
 */
function bubbleProperties(completedWork) {
    // 初始化 subtreeFlags 为 NoFlags
    let subtreeFlags = NoFlags;
    let child = completedWork.child;
    // 遍历当前节点的所有子节点，将子节点的 flags 和 subtreeFlags 合并到 subtreeFlags 中。
    while (child !== null) {
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;
        child = child.sibling;
    }
    // 将合并后的 subtreeFlags 赋值给当前节点的 subtreeFlags。
    completedWork.subtreeFlags |= subtreeFlags;
}


/** 递归遍历当前 Fiber 节点的所有子节点，把所有原生 DOM 节点和文本节点都挂载到 parent 上。
 * 深度优先遍历 Fiber 子树，遇到终端节点（HostComponent/HostText）就挂载到父节点。
 * 附加子节点 将当前 Fiber 节点的所有子节点递归附加到父节点。
 * @param {*} parent 
 * @param {*} workInProgress 
 * @returns 
 */
function appendAllChildren(parent, workInProgress) {
    // 我们只有创建的顶级fiber，但需要递归其子节点来查找所有终端节点
    let node = workInProgress.child;
    // 遍历当前节点的子节点。
    while (node !== null) {
        // 如果是原生节点，直接添加到父节点上
        if (node.tag === HostComponent || node.tag === HostText) {
            // 如果子节点是原生节点或文本节点，调用 appendInitialChild 将其附加到父节点。
            appendInitialChild(parent, node.stateNode);
            // 再看看第一个节节点是不是原生节点
        } else if (node.child !== null) {
            // 如果子节点有子节点，递归处理。
            // node.child.return = node
            node = node.child;
            continue;
        }
        if (node === workInProgress) {
            return;
        }
        // 如果没有弟弟就找父亲的弟弟 如果没有兄弟节点，回溯到父节点，继续处理兄弟节点。
        while (node.sibling === null) {
            // 如果找到了根节点或者回到了原节点结束
            if (node.return === null || node.return === workInProgress) {
                return;
            }
            node = node.return;
        }
        // node.sibling.return = node.return
        // 下一个弟弟节点
        node = node.sibling;
    }
}

/**
 * 根据 Fiber 节点类型（tag）执行不同的处理逻辑。
 * 通过递归和冒泡机制，保证所有 DOM 节点和副作用都能正确处理和传递
 * 
 * 负责把虚拟 Fiber 树转为真实 DOM 树，并为提交阶段准备好副作用信息。
 * 是 React Fiber 渲染流程中的一个关键函数，用于完成当前 Fiber 节点的工作
 * 完成当前 Fiber 节点的工作，包括创建 DOM 实例、附加子节点、冒泡副作用等。
 * 处理不同类型的 Fiber 节点（如 HostComponent、HostRoot、HostText）。
 * 创建 DOM 实例（如 div 或文本节点）。
 * 将子节点附加到父节点。
 * 冒泡子树的副作用标记，为提交阶段（Commit Phase）做准备。
 * @param {*} current 
 * @param {*} workInProgress 
 */
export function completeWork(current, workInProgress) {
    indent.number -= 2;
    logger(" ".repeat(indent.number) + "completeWork", workInProgress);

    // 获取新 props。
    const newProps = workInProgress.pendingProps;
    // 根据 tag 类型分支处理。
    switch (workInProgress.tag) {
        // HostComponent 创建 DOM 实例，递归挂载子节点，初始化属性，冒泡副作用。
        case HostComponent: { // 表示原生 DOM 节点
            const { type } = workInProgress;
            // 创建 DOM 实例：创建 DOM/文本实例并挂载。
            const instance = createInstance(type, newProps, workInProgress);
            // 递归挂载子节点 递归处理子节点
            appendAllChildren(instance, workInProgress);
            // 保存实例
            workInProgress.stateNode = instance;
            // 初始化属性
            finalizeInitialChildren(instance, type, newProps);
            // 冒泡副作用标记。
            bubbleProperties(workInProgress);
            break;
        }
        case HostRoot: // case HostRoot:
            // 调用 bubbleProperties，将子树的副作用标记冒泡到根节点。
            bubbleProperties(workInProgress);
            break;
        case HostText: { // 表示文本节点。
            const newText = newProps;
            // 创建文本实例, 并保存实例
            workInProgress.stateNode = createTextInstance(newText);
            // 冒泡副作用：
            bubbleProperties(workInProgress);
            break;
        }
        default:
            break;
    }
}
