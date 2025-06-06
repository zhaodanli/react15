import { HostRoot, HostComponent, HostText } from "./ReactWorkTags";
import { MutationMask, Placement } from "./ReactFiberFlags";

/** 这段代码实现了 React Fiber commit 阶段的副作用处理，
 *  主要负责根据 Fiber 节点上的副作用标记（flags），递归执行 DOM 操作（如插入、更新、删除等）。
 */


/** 对当前 Fiber 节点及其子树递归处理副作用。
 * 先递归处理所有子节点（recursivelyTraverseMutationEffects），再处理当前节点自身的副作用（commitReconciliationEffects）。
 * 
 * @param {*} finishedWork 
 * @param {*} root 
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
    switch (finishedWork.tag) {
        case HostRoot:
        case HostComponent:
        case HostText: {
            // 先递归处理所有子节点（recursivelyTraverseMutationEffects），
            recursivelyTraverseMutationEffects(root, finishedWork);
            // 再处理当前节点自身的副作用（commitReconciliationEffects）。
            commitReconciliationEffects(finishedWork);
            break;
        }
        default: {
            break;
        }
    }
}

/** 递归遍历当前节点的所有子节点，如果子树有副作用（MutationMask），就递归调用
 * 这样可以保证所有需要处理副作用的节点都被遍历到。
 * @param {*} root 
 * @param {*} parentFiber 
 */
function recursivelyTraverseMutationEffects(root, parentFiber) {
    if (parentFiber.subtreeFlags & MutationMask) {
        let { child } = parentFiber;
        while (child !== null) {
            commitMutationEffectsOnFiber(child, root);
            child = child.sibling;
        }
    }
}


/** 处理当前节点的副作用（这里只处理了 Placement，即插入）。
 * 如果当前节点有 Placement 标记，调用 commitPlacement 执行插入操作，并清除 Placement 标记。
 * @param {*} finishedWork 
 */
function commitReconciliationEffects(finishedWork) {
    const { flags } = finishedWork;
    //   插入操作 
    if (flags & Placement) {
        commitPlacement(finishedWork);
        // 取反
        finishedWork.flags &= ~Placement;
    }
}

/** 实际执行 DOM 插入操作
 * @param {*} finishedWork 
 */
function commitPlacement(finishedWork) {
    console.log("commitPlacement", finishedWork);
}