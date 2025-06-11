import { HostRoot, HostComponent, HostText, FunctionComponent } from "./ReactWorkTags";
import { MutationMask, Placement, Update, Passive } from "./ReactFiberFlags";
import {
    insertBefore,
    appendChild,
    commitUpdate,
    removeChild
} from "react-dom-bindings/src/client/ReactDOMHostConfig.js";
import { HasEffect as HookHasEffect, Passive as HookPassive } from "./ReactHookEffectTags";

/** 这段代码实现了 React Fiber commit 阶段的副作用处理，
 *  主要负责根据 Fiber 节点上的副作用标记（flags），递归执行 DOM 操作（如插入、更新、删除等）。
 * getHostSibling 用于在 commit 阶段确定插入位置，保证新节点插入到正确的 DOM 顺序。
 * 它会跳过还没插入的节点（有 Placement 标记的），只返回已经在 DOM 中的兄弟节点。
 * 如果找不到，说明应该插入到父节点末尾。
 */


/** 对当前 Fiber 节点及其子树递归处理副作用。
 * 先递归处理所有子节点（recursivelyTraverseMutationEffects），再处理当前节点自身的副作用（commitReconciliationEffects）。
 * 
 * @param {*} finishedWork 
 * @param {*} root 
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
    const current = finishedWork.alternate;
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case FunctionComponent:
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);
            break;
        case HostRoot:
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);
            break;
        case HostComponent:
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);
            if (flags & Update) {
                const instance = finishedWork.stateNode;
                if (instance != null) {
                    const newProps = finishedWork.memoizedProps;
                    const oldProps = current !== null ? current.memoizedProps : newProps;
                    const type = finishedWork.type;
                    const updatePayload = finishedWork.updateQueue;
                    finishedWork.updateQueue = null;
                    if (updatePayload !== null) {
                        commitUpdate(instance, updatePayload, type, oldProps, newProps, finishedWork);
                    }
                }
            }
            break;
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
    const deletions = parentFiber.deletions;
    // 有需要被删除的 子fiber
    if (deletions !== null) {
        for (let i = 0; i < deletions.length; i) {
            const childToDelete = deletions[i];
            commitDeletionEffects(root, parentFiber, childToDelete);
        }
        console.log("commitMutationEffectsOnFiber >>>>>>>>>>>>>> deletions:", deletions);
        parentFiber.deletions = null; // 清除已处理的删除列表
    }
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
    //  插入操作 
    if (flags & Placement) {
        commitPlacement(finishedWork);
        // 取反
        finishedWork.flags &= ~Placement;
    }
}

/** 实际执行 DOM 插入操作
 *  检查插入/删除顺序 确认新节点插入时没有插入到已被删除的节点前面。
 * @param {*} finishedWork 
 */
function commitPlacement(finishedWork) {
    // console.log("commitPlacement", finishedWork);
    const parentFiber = getHostParentFiber(finishedWork);
    switch (parentFiber.tag) {
        case HostComponent: {
            const parent = parentFiber.stateNode;
            const before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
        }
        case HostRoot: {
            const parent = parentFiber.stateNode.containerInfo;
            const before = getHostSibling(finishedWork);
            insertOrAppendPlacementNode(finishedWork, before, parent);
            break;
        }
        default:
            break;
    }
}

function getHostParentFiber(fiber) {
    let parent = fiber.return;
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent;
        }
        parent = parent.return;
    }
    return parent;
}

/** 从当前 Fiber 节点向上查找，找到最近的“原生父节点”
 * 在 commit 阶段插入 DOM 时，需要知道插入到哪个父节点下，这个函数就是用来找“真实 DOM 父节点”的。
 *  
 */
function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

/** 查找当前 Fiber 节点在真实 DOM 中的“下一个兄弟节点”（host sibling）。
 * 查找 fiber 在同级中下一个“已经存在于 DOM 中”的原生节点（HostComponent 或 HostText），用于插入操作时确定插入点。
 * 如果找不到，返回 null，表示插入到父节点末尾
 * @param {*} fiber 
 * @returns 
 */
function getHostSibling(fiber) {
    let node = fiber;
    // 
    siblings: while (true) {
        // 从当前 fiber 开始，向右找兄弟节点（sibling）
        while (node.sibling === null) {
            // 如果没有兄弟节点（node.sibling === null），就往父节点（node.return）回溯
            // 直到找到有兄弟的父节点，或者回溯到根/原生父节点为止。
            // 如果回溯到根或原生父节点还没找到，说明当前节点已经是最后一个，返回 null。
            if (node.return === null || isHostParent(node.return)) {
                // 如果我们是根Fiber或者父亲是原生节点，我们就是最后的弟弟
                return null;
            }
            node = node.return;
        }
        // 找到兄弟节点后，向下查找第一个原生节点（HostComponent 或 HostText）
        // node.sibling.return = node.return
        node = node.sibling;
        // 如果兄弟节点不是原生节点，递归往下找它的 child。
        while (node.tag !== HostComponent && node.tag !== HostText) {
            // 如果兄弟节点有 Placement 副作用（即还没插入到 DOM），跳过它，继续找下一个兄弟（continue siblings）。
            // 如果它不是原生节点，并且，我们可能在其中有一个原生节点
            // 试着向下搜索，直到找到为止
            if (node.flags & Placement) {
                // 如果我们没有孩子，可以试试弟弟
                continue siblings;
            } else {
                // 如果兄弟节点不是原生节点，递归往下找它的 child。
                // node.child.return = node
                node = node.child;
            }
        } // Check if this host node is stable or about to be placed.
        // 检查此原生节点是否稳定可以放置
        // 如果找到的节点没有 Placement 标记（即已经在 DOM 中），返回它的 stateNode（真实 DOM 节点）。
        if (!(node.flags & Placement)) {
            // 找到它了!
            return node.stateNode;
        }
    }
}

/** 把当前 Fiber 节点及其所有原生子节点插入到父 DOM 节点的合适位置。
 * 
 * @param {*} node 
 * @param {*} before 
 * @param {*} parent 
 */
function insertOrAppendPlacementNode(node, before, parent) {
    const { tag } = node;
    // isHost：判断当前 Fiber 是否是原生 DOM 节点（HostComponent 或 HostText）。
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        // 如果当前节点是原生节点（如 div、span 或文本节点）
        const { stateNode } = node; // 真实 DOM 节点
        if (before) {
            // 如果指定了 before 节点，则插入到 before 之前
            insertBefore(parent, stateNode, before);
        } else {
            // 否则直接插入到父节点末尾
            appendChild(parent, stateNode);
        }
    } else {
        // 如果当前节点不是原生节点（比如 FunctionComponent、Fragment 等）
        // 递归处理它的所有子节点
        const { child } = node;
        if (child !== null) {
            insertOrAppendPlacementNode(child, before, parent);
            let { sibling } = child;
            while (sibling !== null) {
                insertOrAppendPlacementNode(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
    }
}

/**>>>>>>>>>>>>>>>>>>>>>>>> 以下是删除代码相关 <<<<<<<<<<<<<<<<<<<<<<<<<<< */
let hostParent = null;
function commitDeletionEffects(root, returnFiber, deletedFiber) {
    let parent = returnFiber;
    // 如果只写 break;，只会跳出 switch，while 循环还会继续执行，会继续往上找父节点，这不是我们想要的。
    // 而 break findParent; 可以直接跳出整个 while 循环，查找结束。
    findParent: while (parent !== null) {
        switch (parent.tag) {
            case HostComponent: {
                hostParent = parent.stateNode;
                break findParent;
            }
            case HostRoot: {
                hostParent = parent.stateNode.containerInfo;
                break findParent;
            }
            default:
                break;
        }
        parent = parent.return;
    }
    commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
    hostParent = null;
}

function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    switch (deletedFiber.tag) {
        case HostComponent:
        case HostText: {
            // 遍历执行子节点删除
            recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
            // 删除当前节点
            if (hostParent !== null) {
                removeChild(hostParent, deletedFiber.stateNode);
            }
            break;
        }
        default:
            break;
    }
}

/**
 * 递归遍历子节点，执行删除效果
 * @param {*} finishedRooremoveChildt 
 * @param {*} nearestMountedAncestor 
 * @param {*} parent 
 */
function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    let child = parent.child;
    while (child !== null) {
        commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
        child = child.sibling;
    }
}

/** >>>>>>>>>>>>>>>>>>>>>> 处理 effect <<<<<<<<<<<<<<<<<<<<<<< */



/** >>>>>>>>>>>>>>>>>>>>>> 挂载 <<<<<<<<<<<<<<<<<<<<<<< */
export function commitPassiveMountEffects(root, finishedWork) {
    commitPassiveMountOnFiber(root, finishedWork);
}

function commitPassiveMountOnFiber(finishedRoot, finishedWork) {
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case FunctionComponent: {
            // 递归遍历 PassiveMountEffects
            recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
            // 如果有 Passive 有值【只有函数组件有值】
            if (flags & Passive) {
                commitHookPassiveMountEffects(finishedWork, HookPassive | HookHasEffect);
            }
            break;
        }
        case HostRoot: {
            // 递归遍历 PassiveMountEffects
            recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork);
            break;
        }
        default:
            break;
    }
}

// 提交 PassiveMountEffects
function commitHookPassiveMountEffects(finishedWork, hookFlags) {
    commitHookEffectListMount(hookFlags, finishedWork);
}

// 批量执行所有 useEffect 的副作用函数，并保存清理函数。
function commitHookEffectListMount(flags, finishedWork) {
    // 拿到 队列
    const updateQueue = finishedWork.updateQueue;
    // 拿到最后一个副作用
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        // 找到第一个副作用
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        // 对每个 effect，如果 tag 匹配（比如是 PassiveEffect），就执行 effect.create（即 useEffect 的回调）。
        // 把 create 返回的清理函数（destroy）保存到 effect.destroy，下次卸载或依赖变化时会调用。
        do {
            if ((effect.tag & flags) === flags) {
                const create = effect.create;
                effect.destroy = create();
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}

// 递归遍历 PassiveMountEffects
function recursivelyTraversePassiveMountEffects(root, parentFiber) {
    if (parentFiber.subtreeFlags & Passive) {
        let child = parentFiber.child;
        while (child !== null) {
            commitPassiveMountOnFiber(root, child);
            child = child.sibling;
        }
    }
}

export function commitMutationEffects(finishedWork, root) {
    commitMutationEffectsOnFiber(finishedWork, root);
}


/** >>>>>>>>>>>>>>>>>>>>>> 卸载 <<<<<<<<<<<<<<<<<<<<<<< */

export function commitPassiveUnmountEffects(finishedWork) {
    commitPassiveUnmountOnFiber(finishedWork);
}

function commitPassiveUnmountOnFiber(finishedWork) {
    switch (finishedWork.tag) {
        case FunctionComponent: {
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            if (finishedWork.flags & Passive) {
                commitHookPassiveUnmountEffects(finishedWork, finishedWork.return, HookPassive | HookHasEffect);
            }
            break;
        }
        default: {
            recursivelyTraversePassiveUnmountEffects(finishedWork);
            break;
        }
    }
}

function recursivelyTraversePassiveUnmountEffects(parentFiber) {
    if (parentFiber.subtreeFlags & Passive) {
        let child = parentFiber.child;
        while (child !== null) {
            commitPassiveUnmountOnFiber(child);
            child = child.sibling;
        }
    }
}

function commitHookPassiveUnmountEffects(finishedWork, nearestMountedAncestor, hookFlags) {
    commitHookEffectListUnmount(hookFlags, finishedWork, nearestMountedAncestor);
}

function commitHookEffectListUnmount(flags, finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    if (lastEffect !== null) {
        const firstEffect = lastEffect.next;
        let effect = firstEffect;
        do {
            if ((effect.tag & flags) === flags) {
                const destroy = effect.destroy;
                effect.destroy = undefined;
                if (destroy !== undefined) {
                    destroy();
                }
            }
            effect = effect.next;
        } while (effect !== firstEffect);
    }
}
