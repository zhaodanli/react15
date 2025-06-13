import { createHostRootFiber } from "./ReactFiber.js"
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue.js";
import { NoLanes } from 'react-reconciler/src/ReactFiberLane';

/**
 * 。
 * @param {*} containerInfo 
 */
function FiberRootNode(containerInfo) {
    this.containerInfo = containerInfo;
    this.pendingLanes = NoLanes; // 更上有哪些车道待处理
    this.callbackNode = null;
    this.callbackPriority = NoLanes;
}

export function createFiberRoot(containerInfo) {
    const root = new FiberRootNode(containerInfo);
    // 创建未初始化的fiber
    const uninitializedFiber = createHostRootFiber();
    // current 现在展示的已经渲染好的fiber树， 没有对应虚拟dom, 但是有current
    // fiber树之有两个 current 和 workingInProgress
    root.current = uninitializedFiber;
    uninitializedFiber.stateNode = root;
    // 初始化副作用 把虚拟DOM 放到根节点上，创建 fiber树。 现在把根节点放在了更新队列上
    // 每个节点都有更新队列，计算的时候取出来
    initializeUpdateQueue(uninitializedFiber);
    return root;
}