// 此处有优先队列执行调度
export function scheduleCallback(callback) {
    requestIdleCallback(callback);
}