import { HostRoot, IndeterminateComponent, HostComponent, HostText } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";
import { NoLane, NoLanes } from "./ReactFiberLane";

/**
 * 代码功能概述
 * 这段代码定义了 React Fiber 的核心数据结构 FiberNode，并提供了创建 Fiber 节点的相关方法
 * 代码的核心功能
    * 定义 Fiber 数据结构
    * 创建 Fiber 节点
    * 支持双缓存机制
 * React Fiber 的作用
    * 时间分片（Time Slicing）：
    * 任务调度（Task Scheduling）：
    * 高效更新：
 * /

/**
 * @param {*} tag fiber类型 函数组件0，类组件1， 原生组件5 根元素3
 * @param {*} pendingProps 新属性、等待处理或者生效的属性
 * @param {*} key 唯一标识
 */
export function FiberNode(tag, pendingProps, key) {
    // 基础信息
    this.tag = tag; // Fiber 类型（如函数组件、类组件、原生组件等）
    this.key = key; //// 唯一标识，用于区分同级节点
    this.type = null; // 节点的类型（来自虚拟 DOM 的 type，如 'div' 或组件函数）
    this.stateNode = null; // 对应的真实 DOM 节点或类组件实例

    // 结构信息
    this.return = null; // 指向父 Fiber 节点
    this.child = null; // 指向第一个子 Fiber 节点
    this.sibling = null; // 指向下一个兄弟 Fiber 节点

    // 属性和状态
    this.pendingProps = pendingProps; // 新的属性（等待处理或生效的属性）
    this.memoizedProps = null; // 已经生效的属性
    this.updateQueue = null; // 更新队列，存储需要更新的状态或副作用
    this.memoizedState = null; // 已经生效的状态

    // 副作用 表示针对次fiber进行操作
    this.flags = NoFlags; // 当前节点的副作用标记（如插入、更新、删除等）
    this.subtreeFlags = NoFlags; // 子树的副作用标记 （做这个）为了提高性能， 可以少递归调用

    this.deletions = null; // 存储需要删除的子节点列表

    this.lanes = NoLane;
    this.childLanes = NoLanes;

    // 双缓存机制 双缓存机制允许 React 在内存中构建新的 Fiber 树，同时保留当前屏幕上显示的 Fiber 树。
    this.alternate = null; // 双缓存机制中的另一个 Fiber 节点

    this.index = 0;
    this.ref = null;
}

// 创建一个新的 Fiber 节点。
function createFiber(tag, pendingProps, key) {
    return new FiberNode(tag, pendingProps, key);
}

// 创建根节点的 Fiber
export function createHostRootFiber() {
    return createFiber(HostRoot, null, null);
}

/**
 * 双缓冲池技术，一棵树最多只需要两个版本
 * 将“其他”未使用的我们可以自由重用的节点
 * 这是延迟创建的，以避免分配从未更新的内容的额外对象。它还允许我们如果需要，回收额外的内+存
 * @param {*} current 
 * @param {*} pendingProps 
 */
export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        workInProgress = createFiber(current.tag, pendingProps, current.key);
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        // 将新的属性（pendingProps）赋值给 workInProgress 节点。
        workInProgress.pendingProps = pendingProps;
        // 将 current 节点的类型（type）赋值给 workInProgress 节点。
        workInProgress.type = current.type;
        // 将 workInProgress.flags 重置为 NoFlags。每次更新时，workInProgress 节点的副作用标记需要重新计算。
        // 更新完成后，flags 应该被重置为 NoFlags，以便下一次更新重新计算副作用。
        workInProgress.flags = NoFlags;
        // 如果不重置 subtreeFlags，可能会遗留上一次更新的标记，导致错误的操作。
        workInProgress.subtreeFlags = NoFlags;

        workInProgress.deletions = null;
    }
    /**
        * 第一次更新
        * 创建 workInProgress 树：
        * 调用 createWorkInProgress，为 RootFiber 创建或复用 workInProgress 节点。
        * 复制 current.memoizedState 到 workInProgress.memoizedState。
        * 更新 ChildFiber1 的状态：
        * workInProgress.ChildFiber1.memoizedState 被更新为 { count: 2 }。
        * 第二次更新
        * 复用 workInProgress：
        * 如果不重新赋值 workInProgress.memoizedState = current.memoizedState，workInProgress.ChildFiber1.memoizedState 仍然是 { count: 2 }。
        * 这会导致状态不一致，因为 current.ChildFiber1.memoizedState 仍然是 { count: 1 }。
        * 重新赋值：
        * 通过 workInProgress.memoizedState = current.memoizedState，确保 workInProgress 的初始状态与 current 一致。
        */
    /**
     * 其他字段（如 memoizedProps、memoizedState）表示上一次渲染的状态和属性，它们会在调和过程中被更新。
     */
    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;
    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;
    workInProgress.ref = current.ref;

    workInProgress.flags = current.flags;
    workInProgress.childLanes = current.childLanes;
    workInProgress.lanes = current.lanes;
    return workInProgress;
}

/**
 * 根据 type 和 pendingProps 创建一个新的 Fiber 节点。
 * @param {*} type 
 * @param {*} key 
 * @param {*} pendingProps 
 * @returns 
 */
export function createFiberFromTypeAndProps(type, key, pendingProps) {
    // 每个fiber都会有一个标签 IndeterminateComponent 表示未确定的组件类型
    let fiberTag = IndeterminateComponent;
    // 如果 type 是字符串（如 'div'），将 fiberTag 设置为 HostComponent（表示原生 DOM 节点）。
    if (typeof type === "string") {
        fiberTag = HostComponent;
    }
    const fiber = createFiber(fiberTag, pendingProps, key);
    fiber.type = type;
    return fiber;
}

/**
 * 根据虚拟 DOM 创建 Fiber
 * @param {*} element 
 * @returns 
 */
export function createFiberFromElement(element) {
    const { type, key, props: pendingProps } = element;
    return createFiberFromTypeAndProps(type, key, pendingProps);
}

/**
 * 从文本内容（content）创建一个新的文本类型的 Fiber 节点。
 * @param {*} content 
 * @returns 
 */
export function createFiberFromText(content) {
    return createFiber(HostText, content, null);
}