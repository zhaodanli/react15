import { scheduleCallback } from "scheduler";

/**
 * 按计划执行 
 * @param {} root 
 */
export function scheduleUpdateOnFiber(root) {
    // 确保调度执行root上的更新
    ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
    // 按计划执行回调
    scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 执行root上的并发更新工作
 * 在fiber上构建fiber树，把真实节点插入容器
 * @param {*} root 
 */
function performConcurrentWorkOnRoot(root) {
    console.log("performConcurrentWorkOnRoot");
    // 初次渲染， 同步渲染根节点
    renderRootSync(root)
}

function renderRootSync(root){
    // 构建fiber树
    // prepareFreshStack(root);
}