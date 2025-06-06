import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";
import isArray from "shared/isArray";
import { createFiberFromElement, FiberNode, createFiberFromText } from "./ReactFiber";
import { Placement } from "./ReactFiberFlags";
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
     * @param {*} newFiber 
     * @param {*} newIndex 
     */
    function placeChild(newFiber, newIndex) {
        newFiber.index = newIndex;
        // 如果 shouldTrackSideEffects 为 true，会将 Placement 标记添加到 newFiber.flags，表示该节点需要插入到 DOM 中。
        if (shouldTrackSideEffects) newFiber.flags |= Placement;
    }

    /** 为新创建的 Fiber 节点设置索引（index）和副作用标记（Placement）。
     * @param {*} newFiber 
     * @returns 
     */
    function placeSingleChild(newFiber) {
        if (shouldTrackSideEffects) newFiber.flags |= Placement;
        return newFiber;
    }

    /** 调和单个 React 元素，生成对应的 Fiber 节点
     * 将新 Fiber 节点的 return 指针指向父节点（returnFiber）。
     * @param {*} newFiber 
     * @returns 
     */
    function reconcileSingleElement(returnFiber, currentFirstChild, element) {
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

    /** 调和子节点数组，生成对应的 Fiber 节点链表。
     * @param {*} returnFiber 
     * @param {*} currentFirstChild 
     * @param {*} newChildren 
     * @returns 
     */
    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren) {
        let resultingFirstChild = null; // 用于存储新创建的 Fiber 节点链表的第一个节点 最终会作为函数的返回值。
        let previousNewFiber = null; // 用于存储当前链表中的最后一个节点，方便将新节点连接到链表中。
        let newIdx = 0;
        // 遍历 newChildren 数组，为每个子节点调用 createChild 创建新的 Fiber 节点。
        for (; newIdx < newChildren.length; newIdx++) {
            const newFiber = createChild(returnFiber, newChildren[newIdx]);
            // 如果 createChild 返回 null（表示该子节点无效），跳过当前循环。
            if (newFiber === null) {
                continue;
            }
            // 调用 placeChild 为每个新节点设置索引和副作用标记。
            placeChild(newFiber, newIdx);
            // 将新节点连接成链表，返回链表的第一个节点
            if (previousNewFiber === null) {
                resultingFirstChild = newFiber;
            } else {
                previousNewFiber.sibling = newFiber;
            }
            previousNewFiber = newFiber;
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