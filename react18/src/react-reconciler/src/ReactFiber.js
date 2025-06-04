import { HostRoot } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

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

    // 双缓存机制 双缓存机制允许 React 在内存中构建新的 Fiber 树，同时保留当前屏幕上显示的 Fiber 树。
    this.alternate = null; // 双缓存机制中的另一个 Fiber 节点
}

// 创建一个新的 Fiber 节点。
function createFiber(tag, pendingProps, key) {
    return new FiberNode(tag, pendingProps, key);
}

// 创建根节点的 Fiber
export function createHostRootFiber() {
    return createFiber(HostRoot, null, null);
}