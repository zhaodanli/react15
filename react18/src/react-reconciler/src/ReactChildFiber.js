import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import isArray from "shared/isArray";
import { createFiberFromElement, FiberNode, createFiberFromText, createWorkInProgress } from "./ReactFiber";
import { Placement, ChildDeletion } from "./ReactFiberFlags";
import { HostText } from "./ReactWorkTags";

/**
 * 这段代码定义了 React Fiber 中的子节点调和逻辑（Reconciliation），
 * 用于将新的子节点（newChild）与当前 Fiber 树中的子节点（currentFirstChild）进行比较，
 * 并生成新的 Fiber 节点树。调和的目标是高效地更新 Fiber 树，尽可能复用已有的节点，减少不必要的创建和销毁。
 * /
/**
 * 创建一个子节点调和器，用于比较新旧子节点并生成新的 Fiber 节点
 * 1. 调和单个或多个子节点，生成新的 Fiber 节点树。
 * 2. 根据 newChild 的类型（对象、数组、字符串等）调用不同的调和函数。
 * @param {是否跟踪副作用} shouldTrackSideEffects 
 * @returns 
 */
function createChildReconciler(shouldTrackSideEffects) {
    /** 根据 newChild 的类型（字符串、数字、对象等）创建对应的 Fiber 节点。
     * @param {*} returnFiber 
     * @param {*} newChild 
     * @returns 
     */
    function createChild(returnFiber, newChild) {
        // 如果 newChild 是字符串或数字，调用 createFiberFromText 创建文本节点。
        if ((typeof newChild === "string" && newChild !== "") || typeof newChild === "number") {
            const created = createFiberFromText(`${newChild}`);
            created.return = returnFiber;
            return created;
        }

        // 如果 newChild 是 React 元素，调用 createFiberFromElement 创建元素节点。
        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    const created = createFiberFromElement(newChild);
                    created.return = returnFiber;
                    return created;
                }
                default:
                    break;
            }
        }

        // 如果 newChild 是其他类型，返回 null。
        return null;
    }

    /** 为新创建的 Fiber 节点设置索引（index）和副作用标记（Placement）。
     * .副作用标记逻辑
     * @param {*} newFiber 
     * @param {*} newIndex 
     */
    function placeChild(newFiber, newIndex) {
        newFiber.index = newIndex;

        if (!shouldTrackSideEffects) {
            return;
        }

        const current = newFiber.alternate;
        if(current !== null) {
            return;
        } else {
            newFiber.flags |= Placement;
        }
        // 如果 shouldTrackSideEffects 为 true，会将 Placement 标记添加到 newFiber.flags，表示该节点需要插入到 DOM 中。
        // if (shouldTrackSideEffects) newFiber.flags |= Placement;
    }

    /** 为新创建的 Fiber 节点设置索引（index）和副作用标记（Placement）。
     * @param {*} newFiber 
     * @returns 
     */
    function placeSingleChild(newFiber) {
        // 说明要添加副作用
        // shouldTrackSideEffects true：表示当前是“更新阶段”，需要跟踪副作用
        // alternate 指向上一次渲染的旧 Fiber。 为 null：说明这个 Fiber 是新创建的，不是复用的老节点。
        // 执行插入操作
        if (shouldTrackSideEffects && newFiber.alternate === null) {
            newFiber.flags |= Placement;
        }
        return newFiber;
    }

    function useFiber(fiber, pendingProps) {
        // 创建一个新的 Fiber 节点，复用现有的 Fiber 节点（fiber），并更新其 props。
        const clone = createWorkInProgress(fiber, pendingProps);
        clone.index = 0;
        clone.sibling = null;
        return clone;
    }

    function deleteChild(returnFiber, childToDelete) {
        // 不需要跟踪副作用，则返回 18之前是放在effectlist中， 现在是存在变量里
        if (!shouldTrackSideEffects) {
            return;
        }
        const deletions = returnFiber.deletions;
        if (deletions === null) {
            returnFiber.deletions = [childToDelete];
            returnFiber.flags |= ChildDeletion;
        } else {
            deletions.push(childToDelete);
        }
    }

    // 删除所有剩余的子节点。
    function deleteRemainingChildren(returnFiber, currentFirstChild) {
        if (!shouldTrackSideEffects) {
            return;
        }
        let childToDelete = currentFirstChild;
        while (childToDelete !== null) {
            deleteChild(returnFiber, childToDelete);
            childToDelete = childToDelete.sibling;
        }
        return null;
    }

    /** 调和单个 React 元素，生成对应的 Fiber 节点
     * 将新 Fiber 节点的 return 指针指向父节点（returnFiber）。
     * 单节点 diff diff逻辑如下
     * 1. 是否有老fiber节点
     * 如果没有老fiber节点，创建新fiber节点
     * 
     * 2. 如果有老fiber节点，复用老fiber节点 判断key
     * 如果key相同，
        *  2.1判断type
            * 如果type相同，复用老fiber节点，更新props
            * 如果type不同，删除包括fiber在内的所有老fiber，老fiber节点，创建新fiber节点
    * 2.2 如果key不同，删除当前fiber, 继续查找下一个 fiber节点A(key="a") -> B(key="b") -> C(key="c")
     * @param {*} newFiber 
     * @returns 
     */
    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
        const key = element.key;
        let child = currentFirstChild;
        //  1. 是否有老fiber节点
        while (child !== null) {
            // 2. 如果有老fiber节点，复用老fiber节点 判断key
            if (child.key === key) {
                // 找到匹配的子节点，返回该子节点
                const elementType = element.type;
                // 2.1 key 相同，说明新旧节点在语义上是“同一个位置的节点”。
                // 但 type 不同，说明节点类型变了（比如 <div key="a"> 变成 <span key="a">），不能复用，必须把这个位置及其后面的所有老 fiber 全部删除，然后用新 type 创建 fiber。
                // [ {key:"a", type:"span"} ]
                // key="a" 匹配，但 type 不同（div 变成 span），
                // 这时要删除 A 及其后面的所有 fiber（包括 B），然后新建一个 span 的 fiber
                // 当前位置的节点类型变了，后面兄弟节点也都不再有意义，全部清除。
                if (child.type === elementType) {
                    deleteRemainingChildren(returnFiber, child.sibling);
                    // 复用节点
                    const existing = useFiber(child, element.props);
                    existing.return = returnFiber;
                    return existing;
                }else {
                    // 2.1 如果 type 不同，删除包括 fiber 在内的所有老 fiber 节点。
                    // 删除当前 fiber 及其后续所有兄弟节点
                    deleteRemainingChildren(returnFiber, child);
                    break;
                }
            } else {
                // 2.2 如果key不同，删除当前fiber, 继续查找下一个 fiber节点A(key="a") -> B(key="b") -> C(key="c")
                // 只删除当前 fiber，是为了支持“乱序重用”，比如 key="b" 只是位置变了，不应该直接删除所有后续节点。
                deleteChild(returnFiber, child);
            }
            child = child.sibling;
        }
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }

    /** 调和单个文本节点，生成对应的 Fiber 节点
     * 将新 Fiber 节点的 return 指针指向父节点（returnFiber）。
     * @param {*} returnFiber 
     * @param {*} currentFirstChild 
     * @param {*} content 
     * @returns 
     */
    function reconcileSingleTextNode(returnFiber, currentFirstChild, content) {
        const created = new FiberNode(HostText, { content }, null);
        created.return = returnFiber;
        return created;
    }

    function updateElement(returnFiber, current, element) {
        const elementType = element.type;

        if (current !== null) {
            // 如果 oldFiber 存在且类型匹配，复用 oldFiber。
            // 复用 oldFiber，更新其 props。
            if (current.type === elementType) {
                const existing = useFiber(current, element.props);
                existing.return = returnFiber;
                return existing;
            }
        }

        // 如果 oldFiber 是 null，说明没有老节点，直接创建新节点
        const created = createFiberFromElement(element);
        created.return = returnFiber;
        return created;
    }

    function updateSlot(returnFiber, oldFiber, newChild) {
        const key = oldFiber !== null ? oldFiber.key : null;
        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    // 如果 newChild 是 React 元素，检查 key 是否匹配。
                    if (newChild.key === key) {
                        return updateElement(returnFiber, oldFiber, newChild);
                    }
                }
                default:
                    break;
            }
        }
    }

    /** 调和子节点数组，生成对应的 Fiber 节点链表。
     * @param {*} returnFiber 
     * @param {*} currentFirstChild 
     * @param {*} newChildren 
     * @returns 
     * React 源码的 reconcileChildrenArray 实现比你看到的伪代码更复杂，它 break 后还会有一段“map-based diff”逻辑，专门处理这种“乱序/插入/删除混合”的场景：
        break 后会把剩下的 oldFiber 按 key/type 建立一个 map
        然后遍历剩下的 newChildren，尝试在 map 里找可复用的 oldFiber，找不到就新建
        最后把 map 里没用到的 oldFiber 全部删除
        你当前看到的代码是简化版，适合“头部对齐”场景。更复杂的场景需要 map diff。
     */
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        let resultingFirstChild = null; // 新链表的头 用于存储新创建的 Fiber 节点链表的第一个节点 最终会作为函数的返回值。
        let previousNewFiber = null; // 新链表的尾 用于存储当前链表中的最后一个节点，方便将新节点连接到链表中。
        let newIdx = 0; // 新子节点数组的下标

        let oldFiber = currentFirstChild; // 当前旧 Fiber 链表的节点
        let nextOldFiber = null;
        // 1. 同时遍历 oldFiber 和 newChildren，尝试复用、更新、删除
        // 尝试复用 oldFiber，能复用就复用，不能复用就 break。
        // 主循环：同步遍历 oldFiber 和 newChildren
        for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
            nextOldFiber = oldFiber.sibling;
            // 尝试用 oldFiber 和 newChildren[newIdx] 生成新 Fiber（能复用就复用，不能复用就新建）
            const newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx]);
            // 如果 newFiber === null，说明不能复用，跳出循环，后续节点需要特殊处理。
            if (newFiber === null) {
                break; // 不能复用，跳出循环
            }
            if (shouldTrackSideEffects) {
                if (oldFiber && newFiber.alternate === null) {
                    // 如果新 Fiber 没有 alternate（不是复用的），则把 oldFiber 标记为删除。
                    deleteChild(returnFiber, oldFiber);
                }
            }
            // 为新 Fiber 设置 index 和副作用标记（如 Placement）。
            placeChild(newFiber, newIdx);
            // 把新 Fiber 挂到链表上。
            if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
            }else {
                previousNewFiber.sibling = newFiber;
            }

            previousNewFiber = newFiber;
            oldFiber = nextOldFiber;
        }

        // 2. 如果 newChildren 用完了，老fiber还有剩余，全部删除
        // 说明新数组比旧链表短，多余的 oldFiber 都要删除
        if (newIdx === newChildren.length) {
            deleteRemainingChildren(returnFiber, oldFiber);
        }

        // 3. 如果老fiber用完了，newChildren还有剩余，全部新建
        // 说明新数组比旧链表长，多出来的 newChildren 都要新建 Fiber
        if (oldFiber === null) {
            for (; newIdx < newChildren.length; newIdx++) {
                const newFiber = createChild(returnFiber, newChildren[newIdx]);
                if (newFiber === null) {
                    continue;
                }
                placeChild(newFiber, newIdx);
                if (previousNewFiber === null) {
                    resultingFirstChild = newFiber;
                } else {
                    previousNewFiber.sibling = newFiber;
                }
                previousNewFiber = newFiber;
            }
        }
        return resultingFirstChild;
    }

    /**  调和单个或多个子节点，生成新的 Fiber 节点树。
     * @param {当前 Fiber 节点（父节点）} returnFiber 
     * @param {当前 Fiber 树中的第一个子节点} currentFirstChild 
     * @param {新的子节点（React 元素、文本、数组等）。} newChild 
     * @returns 
     */
    function reconcileChildFibers(returnFiber, currentFirstChild, newChild) {
        // 处理单个 React 元素
        if (typeof newChild === "object" && newChild !== null) {
            switch (newChild.$$typeof) {
                case REACT_ELEMENT_TYPE: {
                    return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstChild, newChild));
                }
                default:
                    break;
            }
            // 处理子节点数组
            if (isArray(newChild)) {
                return reconcileChildrenArray(returnFiber, currentFirstChild, newChild);
            }
        }
        //  处理文本节点
        if (typeof newChild === "string") {
            return placeSingleChild(reconcileSingleTextNode(returnFiber, currentFirstChild, newChild));
        }
        return null;
    }
    return reconcileChildFibers;
}
/** 用于更新阶段，跟踪副作用（shouldTrackSideEffects = true）。
 * 将 newChild 与 currentFirstChild 进行比较。
 * 尽可能复用已有的 Fiber 节点，减少不必要的创建和销毁。
 * 跟踪副作用（如插入、删除等操作）。
 *  */
export const reconcileChildFibers = createChildReconciler(true);
// 用于初次挂载阶段，不跟踪副作用（shouldTrackSideEffects = false）。
export const mountChildFibers = createChildReconciler(false);