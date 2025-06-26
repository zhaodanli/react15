import { useRef } from 'react';
import depsAreSame from '../utils/depsAreSame';

/** 根据给定的工厂函数（factory）和依赖数组（deps）创建和缓存一个对象。
 * 以下是代码逐步分析及其作用总结，
 * 为什么 useCreation 被认为是 useMemo 或 useRef 的替代品。
 * 相比于 useMemo：useMemo 会在每次组件渲染时检查依赖关系，看是否需要重新计算值，但是在某些情况下（例如，某些依赖没有发生变化），它可能不被重新计算。
 * 由于 useMemo 依赖于 React 的渲染流程，在某些边缘情况，如状态更新后，可能会出现不一致的行为，这会导致值可能会被错误地重计算。
 * useCreation 的优势：useCreation 提供了更强的一致性，因为它使用一个持久化的引用（通过 useRef）来存储对象，
 * 以及一个简单的逻辑来判断是否需要重新创建它。只在依赖发生变化或未初始化时重新计算，能够更可靠地保证只有在确定的条件下才会创建新的对象。
 * 这一点特别有用，例如当你需要确保某种状态或对象（如某个类的实例）只在依赖变化时才会重新产生。
 * 
 * useCreation 的设计和实现使其能够比常规的 useMemo 更加稳定地 memoize 值，因为它依赖于一些灵活的条件来决定是否需要重新创建对象。
 * 这个特点使得它在需要创建复杂对象或类实例的场景中更具实用性和一致性。
 * @param {*} factory 
 * @param {*} deps 
 * @returns 
 */
export default function useCreation(factory, deps) {
    // 初始化状态：使用 useRef 来存储一个对象，该对象包含 deps、obj 和 initialized 字段。initialized 用于跟踪对象是否已被创建。
    const { current } = useRef({
        deps,
        obj: undefined,
        initialized: false
    });
 
    // 依赖检查: 检查是否需要重新创建对象 使用 depsAreSame 函数判断当前的 deps 和传入的 deps 是否相同。只有在依赖项改变或者尚未初始化的情况下，才会调用工厂函数生成新的对象。
    if (current.initialized === false || !depsAreSame(current.deps, deps)) {
        // 生成和返回对象: 如果需要更新（即依赖变化或尚未初始化），调用工厂函数并将结果存储在 current.obj 中。最后返回该对象。
        current.deps = deps; // 更新依赖
        current.obj = factory(); // 调用工厂函数生成对象
        current.initialized = true; // 标记为已初始化
    }
    return current.obj; // 返回缓存的对象
}