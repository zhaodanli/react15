import { HostRoot, HostComponent, HostText, IndeterminateComponent, FunctionComponent } from "./ReactWorkTags";
import { processUpdateQueue, cloneUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import logger, { indent } from "shared/logger";
import { renderWithHooks } from "react-reconciler/src/ReactFiberHooks";
import { NoLanes } from './ReactFiberLane';

/** React Fiber 架构中beginWork 阶段的核心逻辑
 * 1. 根据虚拟 DOM 生成/更新 Fiber 子链表。
 * 根据当前 Fiber 节点类型，生成或更新其子 Fiber 链表，为后续的渲染和 DOM 更新做准备。
 * 2. 通过 diff 算法，实现高效的最小化 DOM 更新。
 * “构建 Fiber 子树”和“diff 虚拟 DOM”
 */

/** 根据是否有老 Fiber，决定是新建 Fiber 子链表（首次挂载）还是 diff 更新（最小化 DOM 变更）。
 * 实现了 React 的“最小化更新”策略（DOM Diff）
 * 更新：diff 老 Fiber 和新虚拟 DOM，最小化更新。
 * 首次挂载：直接创建所有子 Fiber。
 * @param {*} current 
 * @param {*} workInProgress 
 * @param {*} nextChildren 
 */
function reconcileChildren(current, workInProgress, nextChildren) {
    // 首次挂载（current === null）说明当前节点是新创建的，没有老 Fiber。
    if (current === null) {
        // 调用 mountChildFibers，根据 nextChildren（新的虚拟 DOM）生成一条新的 Fiber 子链表。
        workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
    } else { // 更新的
        // 说明当前节点已经渲染过，有老 Fiber。
        // 调用 reconcileChildFibers，把老 Fiber 的子链表（current.child）和新的虚拟 DOM（nextChildren）进行对比（diff）。
        // 只对有变化的部分创建/删除 Fiber，能复用的就复用，实现最小化 DOM 更新。
        workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
    }
}

/** 处理根节点（HostRoot），从更新队列获取最新虚拟 DOM，生成/更新子 Fiber 链表
 * @param {*} current 
 * @param {*} workInProgress 
 * @returns 
 */
function updateHostRoot(current, workInProgress, renderLanes) {
    const nextProps = workInProgress.pendingProps;
    cloneUpdateQueue(current, workInProgress);
    // 从更新队列里拿去子虚拟DOM信息 workInProgress.memoizedState = palyload.elemnt
    processUpdateQueue(workInProgress, nextProps, renderLanes); // 处理 setState 队列，得到最新 state
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

/** 处理函数组件，执行函数组件逻辑，生成子 Fiber。
 * 是 React Fiber 架构中首次挂载函数组件时的处理方法。它的作用是：
 * 执行函数组件的逻辑，生成其子 Fiber，并将当前 Fiber 的 tag 标记为 FunctionComponent。
 * @param {*} _current 
 * @param {*} workInProgress 
 * @param {*} Component 
 * @returns 
 */
function mountIndeterminateComponent(_current, workInProgress, Component) {
    // 获取当前组件的 props。
    const props = workInProgress.pendingProps;
    // 执行函数组件逻辑（支持 hooks）
    // 调用 renderWithHooks，执行函数组件本身，并处理 hooks 相关逻辑。得到函数组件返回的子元素（通常是 React 元素或虚拟 DOM）。
    const value = renderWithHooks(null, workInProgress, Component, props);
    workInProgress.tag = FunctionComponent;
    // 函数组件返回的子元素递归生成 Fiber 子链表（首次挂载，所以 current 传 null）。
    reconcileChildren(null, workInProgress, value);
    // 返回第一个子 Fiber
    return workInProgress.child;
}

function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
    const nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, renderLanes);
    reconcileChildren(current, workInProgress, nextChildren);
    return workInProgress.child;
}

/** 根据 Fiber 节点类型，分发到不同的处理函数，生成/更新子 Fiber 链表。
 * 根节点：处理更新队列，生成子 Fiber。
 * 原生节点：判断是否有子节点，生成/更新子 Fiber。
 * 文本节点：没有子节点，返回 null。
 * 函数组件：执行组件逻辑，生成子 Fiber。
 * 根据虚拟DOM构建新的fiber子链表
 * 给 workInProgress 赋值
 * @param {老fiber} current 
 * @param {新fiber} workInProgress 
 */
export function beginWork(current, workInProgress, renderLanes) {
    workInProgress.lanes = NoLanes;
    // logger(" ".repeat(indent.number) + "beginWork", workInProgress);
    // indent.number += 2;
    switch (workInProgress.tag) {
        case IndeterminateComponent: {
            return mountIndeterminateComponent(
                current, workInProgress, workInProgress.type, renderLanes
            )
        }
        case FunctionComponent: {
            const Component = workInProgress.type;
            const resolvedProps = workInProgress.pendingProps;
            return updateFunctionComponent(
                current, workInProgress, Component, resolvedProps, renderLanes
            );
        }
        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);
        case HostComponent:
            return updateHostComponent(current, workInProgress, renderLanes);
        case HostText: // 文本节点没有子节点，所以是null
        default:
            return null;
    }
}