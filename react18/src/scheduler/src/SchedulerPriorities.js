export const NoPriority = 0; // 没有优先级，通常用于未初始化或无任务状态。
export const ImmediatePriority = 1; // 最高优先级，表示任务需要立即执行，如同步更新、紧急响应。
export const UserBlockingPriority = 2; // 用户交互阻塞优先级，表示任务与用户输入相关，需要尽快完成（如输入、点击）。
export const NormalPriority = 3; // 普通优先级，常规任务，既不紧急也不延后。
export const LowPriority = 4; // 低优先级，可以延后执行的任务（如日志、预加载等）。
export const IdlePriority = 5; // 最低优先级，只在浏览器空闲时才执行的任务。

/**
 * 这个文件定义了调度器的优先级常量，用于标识不同任务的紧急程度
 */