import { HostRoot, HostComponent, HostText, IndeterminateComponent, FunctionComponent } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import logger, { indent } from "shared/logger";
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";

/** 根据当前 Fiber 节点类型，生成或更新其子 Fiber 链表，为后续的渲染和 DOM 更新做准备。
 * “构建 Fiber 子树”和“diff 虚拟 DOM”
 * React 的“最小化更新”策略（DOM Diff）
 * @param {*} current 
 * @param {*} workInProgress 
 * @param {*} nextChildren 
 */
function reconcileChildren(current, workInProgress, nextChildren) {
    // 没老fiber 新创建的
    if (current === null) {
        // 首次挂载，创建子 Fiber 链表
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else { // 更新的
        // 协调子fiber链表， 老fiber和新fiber比较，进行最小化更新 DOM DIFF
        // 更新，diff 老 Fiber 和新虚拟 DOM，最小化更新
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}

/** 处理根节点（HostRoot），从更新队列获取最新虚拟 DOM，生成/更新子 Fiber 链表
 * 
 * @param {*} current 
 * @param {*} workInProgress 
 * @returns 
 */
function updateHostRoot(current, workInProgress) {
    // 从更新队列里拿去子虚拟DOM信息 workInProgress.memoizedState = palyload.elemnt
    processUpdateQueue(workInProgress); // 处理 setState 队列，得到最新 state
    const nextState = workInProgress.memoizedState;
    // 获取新的虚拟DOM
    const nextChildren = nextState.element; // 拿到新的虚拟 DOM

    // 协调子节点 DOM DIFF 在这里面 根据新的虚拟DOM生成子fiber链表， 老的父fiber、新的父fiber， 新的虚拟DOM
    reconcileChildren(current, workInProgress, nextChildren); // 协调子节点
    return workInProgress.child;
}


/** 处理原生 DOM 节点（HostComponent），判断是否为纯文本节点，协调子节点
 * @param {*} current 
 * @param {*} workInProgress 
 * @returns 
 */
function updateHostComponent(current, workInProgress) {
    const { type } = workInProgress;
    const nextProps = workInProgress.pendingProps;
    let nextChildren = nextProps.children;
    const isDirectTextChild = shouldSetTextContent(type, nextProps);
    if (isDirectTextChild) {
        nextChildren = null;
    }
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

function mountIndeterminateComponent(_current, workInProgress, Component) {
    const props = workInProgress.pendingProps;
    const value = renderWithHooks(null, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    reconcileChildren(null, workInProgress, value);
    return workInProgress.child;
}

/** 根据 Fiber 节点类型，分发到不同的处理函数，生成/更新子 Fiber 链表。
 * 原生节点：判断是否有子节点，生成/更新子 Fiber。
 * 文本节点：没有子节点，返回 null。
 * 根节点：处理更新队列，生成子 Fiber。
 * 根据虚拟DOM构建新的fiber子链表
 * 给 workInProgress 赋值
 * @param {老fiber} current 
 * @param {新fiber} workInProgress 
 */
export function beginWork(current, workInProgress) {
    // logger(" ".repeat(indent.number) + "beginWork", workInProgress);
    // indent.number += 2;
    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(
                current, workInProgress, workInProgress.type
            )
        }
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
        case HostText: // 文本节点没有子节点，所以是null
        default:
            return null;
    }
}