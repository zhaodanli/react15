import {
    NoLane, DefaultLane, getHighestPriorityLane,
    includesNonIdleWork, SyncLane, InputContinuousLane, IdleLane
} from './ReactFiberLane';


/** ------->>>>>>>>>>>>>>>>>>>>>>>>>>>> 事件优先级常量 <<<<<<<<<<<<<<<<<<<<<-------------------- */
export const DefaultEventPriority = DefaultLane; // 默认 16
export const DiscreteEventPriority = SyncLane; // 离散 1
export const ContinuousEventPriority = InputContinuousLane; // 连续事件 4
export const IdleEventPriority = IdleLane; // 空闲事件


/** ------->>>>>>>>>>>>>>>>>>>>>>>>>>>> 事件优先级常量 <<<<<<<<<<<<<<<<<<<<<-------------------- */
// 用于记录和设置当前正在处理的事件优先级（如在事件回调或更新流程中临时提升/恢复优先级）。
let currentUpdatePriority = NoLane;

export function getCurrentUpdatePriority() {
    return currentUpdatePriority;
}

export function setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
}

/** ------->>>>>>>>>>>>>>>>>>>>>>>>>>>> 优先级比较 <<<<<<<<<<<<<<<<<<<<<-------------------- */

// 判断 a 是否比 b 优先级高（lane 数值越小优先级越高）
export function isHigherEventPriority(a, b) {
    return a !== 0 && a < b;
}


// 把一组 lanes（可能有多个优先级）映射为一个事件优先级 用于事件系统和调度器之间的桥接。
export function lanesToEventPriority(lanes) {
    // 取出最高优先级的 lane。
    const lane = getHighestPriorityLane(lanes);

    // 如果是离散事件优先级或更高，返回 DiscreteEventPriority。
    if (!isHigherEventPriority(DiscreteEventPriority, lane)) {
        return DiscreteEventPriority;
    }

    // 如果是连续事件优先级或更高，返回 ContinuousEventPriority。
    if (!isHigherEventPriority(ContinuousEventPriority, lane)) {
        return ContinuousEventPriority;
    }

    // 如果还有非空闲工作，返回 DefaultEventPriority。
    if (includesNonIdleWork(lane)) {
        return DefaultEventPriority;
    }

    // 否则返回 IdleEventPriority。
    return IdleEventPriority;
}