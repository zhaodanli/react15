import { DiscreteEventPriority, getCurrentUpdatePriority, setCurrentUpdatePriority } from './ReactEventPriorities.js';

// 同步队列
let syncQueue = null;
// 是否正在执行同步队列
let isFlushingSyncQueue = false;

export function scheduleSyncCallback(callback) {
    if (syncQueue === null) {
        syncQueue = [callback];
    } else {
        syncQueue.push(callback);
    }
}

export function flushSyncCallbacks() {
    // 队列不为空， 且当前没有在执行
    if (!isFlushingSyncQueue && syncQueue !== null) {
        isFlushingSyncQueue = true;
        let i = 0;
        // 暂存当前更新优先级
        const previousUpdatePriority = getCurrentUpdatePriority();
        try {
            // 设置同步
            const isSync = true;
            // 设置队列
            const queue = syncQueue;
            // 设置优先级
            setCurrentUpdatePriority(DiscreteEventPriority);
            for (; i < queue.length; i++) {
                let callback = queue[i];
                do {
                    callback = callback(isSync);
                } while (callback !== null);
            }
            syncQueue = null;
        } finally {
            // 重制为上一个优先级
            setCurrentUpdatePriority(previousUpdatePriority);
            isFlushingSyncQueue = false;
        }
    }
    return null;
}