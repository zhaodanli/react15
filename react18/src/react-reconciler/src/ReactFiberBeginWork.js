import { HostRoot, HostComponent, HostText } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import logger, { indent } from "shared/logger";

function reconcileChildren(current, workInProgress, nextChildren) {
    // 没老fiber 新创建的
    if (current === null) {
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else { // 更新的
        // 协调子fiber链表， 老fiber和新fiber比较，进行最小化更新 DOM DIFF
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}

/**
 * 
 * @param {*} current 
 * @param {*} workInProgress 
 * @returns 
 */
function updateHostRoot(current, workInProgress) {
    // 从更新队列里拿去子虚拟DOM信息 workInProgress.memoizedState = palyload.elemnt
    processUpdateQueue(workInProgress);
    const nextState = workInProgress.memoizedState;
    // 获取新的虚拟DOM
    const nextChildren = nextState.element;

    // 协调子节点 DOM DIFF 在这里面 根据新的虚拟DOM生成子fiber链表， 老的父fiber、新的父fiber， 新的虚拟DOM
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

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

/**
 * 根据虚拟DOM构建新的fiber子链表
 * 给 workInProgress 赋值
 * @param {老fiber} current 
 * @param {新fiber} workInProgress 
 */
export function beginWork(current, workInProgress) {
    logger(" ".repeat(indent.number) + "beginWork", workInProgress);
    indent.number += 2;
    switch (workInProgress.tag) {
        case HostRoot:
            return updateHostRoot(current, workInProgress);
        case HostComponent:
            return updateHostComponent(current, workInProgress);
        case HostText: // 文本节点没有子节点，所以是null
        default:
            return null;
    }
}