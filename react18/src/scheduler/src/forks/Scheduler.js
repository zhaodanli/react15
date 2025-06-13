import {
    ImmediatePriority,
    UserBlockingPriority,
    NormalPriority,
    LowPriority,
    IdlePriority,
} from "../SchedulerPriorities.js";
import { push, pop, peek } from "../SchedulerMinHeap.js";
import { frameYieldMs } from "../SchedulerFeatureFlags.js";

/** 
 * 这个文件是 React Scheduler 的核心实现之一，
 * 负责任务调度、优先级管理、时间切片、任务队列管理等。
    * 任务调度: 基于最小堆的任务优先队列和时间切片调度器
    * 优先级管理: 支持多优先级任务，保证高优先级任务优先执行，低优先级任务延后。
    * 时间切片: 通过 MessageChannel 实现微任务调度，保证任务在主线程空闲时分片执行，提升响应性。
    * 任务队列管理：是 React 并发调度（Concurrent Mode）和时间切片（Time Slicing）能力的基础。
 * 它让 React 能够在浏览器空闲时分片执行任务，保证高优先级任务优先、低优先级任务延后，提升响应性和流畅度。
 */


/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 任务优先级与超时 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

// 不同优先级对应不同的超时时间（如 Immediate -1ms，UserBlocking 250ms，Normal 5000ms，Low 10000ms，Idle 最大）。
// 任务的 sortIndex 决定其在堆中的顺序，保证高优先级任务先执行。
// 最终赋值给 timeout 代表过期时间（超时等待时间）
const maxSigned31BitInt = 1073741823; // 最大有符号的整形
const IMMEDIATE_PRIORITY_TIMEOUT = -1; // 立刻过期
const USER_BLOCKING_PRIORITY_TIMEOUT = 250; // 最终过期
const NORMAL_PRIORITY_TIMEOUT = 5000; // 正常优先级过期时间
const LOW_PRIORITY_TIMEOUT = 10000; // 低优先级过期时间
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // 永远不过期


/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 关键变量 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
const taskQueue = []; // 任务优先队列（最小堆），存放所有待执行的任务。
let taskIdCounter = 1; // 任务自增 id 计数器，排序用
let scheduledHostCallback = null; // 当前调度的主回调。
let startTime = -1; // 当前帧的起始时间
let currentTask = null; // 当前正在执行的任务
const frameInterval = frameYieldMs; // 每帧最大可用时间
const channel = new MessageChannel(); // 用 MessageChannel 实现微任务调度，保证任务在主线程空闲时执行
const port = channel.port2;

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 时间获取与微任务调度 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */
const getCurrentTime = () => performance.now(); // 获取高精度时间 newDate 有时区问题，不同浏览器不一样。performance 时相对时间，更精确
// 这里接收
channel.port1.onmessage = performWorkUntilDeadline; // 通过 port.postMessage 触发微任务。 调度工作 直到截止时间


/** 微任务回调，执行调度的主回调 scheduledHostCallback，如果还有任务则继续调度 */
function schedulePerformWorkUntilDeadline() {
    port.postMessage(null); // 这里发送微任务
}

// unstable_scheduleCallback ->> requestHostCallback(flushWork) ->> schedulePerformWorkUntilDeadline
function requestHostCallback(callback) { // flushWork
    // 缓存回调函数 即 flashWork
    scheduledHostCallback = callback;
    // 调度工作 直到截止时间
    schedulePerformWorkUntilDeadline();
}

/**  微任务回调，执行调度的主回调
 * unstable_scheduleCallback ->> requestHostCallback(flushWork) ->> schedulePerformWorkUntilDeadline （计算 Deadline）
    * ->> performWorkUntilDeadline ->> flushWork(有一个 startTime 的流转) 执行 ->> workLoop
    * ->> 返回 hasMoreWork ->> schedulePerformWorkUntilDeadline/清空
    * performWorkUntilDeadline 其实就是 schedulePerformWorkUntilDeadline 真正的执行方法
    * 时间流转 记录本帧的起始时间 ->>>> 传递给 flushWork
* */
function performWorkUntilDeadline() {
    if (scheduledHostCallback !== null) {
        // 获取开始执行任务时间， 从运行到现在的相对时间
        startTime = getCurrentTime(); // 记录本帧的起始时间
        // 是否有更多的工作要做
        let hasMoreWork = true;
        try {
            // 执行 flushWork 判断有没有返回值
            hasMoreWork = scheduledHostCallback(startTime);
        } finally {
            // 还有更多工作要做
            if (hasMoreWork) {
                // 继续执行 
                schedulePerformWorkUntilDeadline(); // 还有任务，继续下一帧
            } else {
                // 清空
                scheduledHostCallback = null;
            }
        }
    }
}

/** >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 任务调度主流程 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

/** 任务入队
 * 1. 创建 newTask: { calback, expirationTime, priorityLevel} 
 * 2. 将任务入队 taskQueue: [ { newTask: { calback, expirationTime, priorityLevel }  }]
 * 3. 执行 unstable_scheduleCallback ->> requestHostCallback(flushWork) ->> 
    * schedulePerformWorkUntilDeadline
 * 4. 返回 newTask
 * 时间流转 记录任务入队时的时间 ->>> 计算任务的过期时间 ->> 触发调度
 *  */ 
function unstable_scheduleCallback(priorityLevel, callback) {
    // 获取当前时间
    const currentTime = getCurrentTime(); // 记录任务入队时的时间
    // 此任务开始时间
    const startTime = currentTime;
    let timeout;
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT;
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT;
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT;
            break;
        case NormalPriority:
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT;
            break;
    }
    // 计算任务的 expirationTime（当前时间+优先级对应的超时时间）。
    const expirationTime = startTime + timeout;
    // 创建任务对象，设置 sortIndex = expirationTime。
    const newTask = {
        id: taskIdCounter++,
        callback, // 回调（任务）
        priorityLevel, // 优先级
        startTime, // 开始时间
        expirationTime, // 过期时间
        sortIndex: expirationTime, // 排序依据 过期时间
    };
    // 通过 push 加入 taskQueue（最小堆，保证优先级高的任务在前）。
    push(taskQueue, newTask);
    // 调用 requestHostCallback(flushWork)，触发调度。
    // 执行任务， 刷新工作
    requestHostCallback(flushWork);
    return newTask;
}

/** 任务执行 直接调用 workLoop(initialTime)，循环执行任务。
 *  */ 
function flushWork(initialTime) {
    return workLoop(initialTime);
}

/** 
 * 一次取出，并执行任务；返回true或者false 
 * 调度开始传过来的 帧起始时间 ->>>> 过期时间和帧起时间比较 ->>>
 * */
function workLoop(initialTime) {
    let currentTime = initialTime; // 帧起始时间
    // 不断从队列取出优先级最高的任务（peek(taskQueue))
    currentTask = peek(taskQueue);
    while (currentTask !== null) {
        // 如果任务还没到期且本帧时间用完（shouldYieldToHost()），则暂停，等待下一帧
        // 判断本帧是否已经用完时间片，决定是否让出主线程
        if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
            break;
        }
        // 否则执行任务的回调（callback(didUserCallbackTimeout)）
        const callback = currentTask.callback;
        // 如果回调返回 continuationCallback，说明任务未完成，继续挂回队列。
        if (typeof callback === "function") {
            currentTask.callback = null; // 先清掉 callback
            const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
            const continuationCallback = callback(didUserCallbackTimeout);
            currentTime = getCurrentTime(); // 每次执行后更新时间
            
            // 如果执行完返回新函数，还需要继续执行回调
            if (typeof continuationCallback === "function") {
                // 更新 回调 到 回调
                currentTask.callback = continuationCallback;
                return true;
            }

            // 如果次任务完成，把次任务弹出
            if (currentTask === peek(taskQueue)) {
                pop(taskQueue);
            }
        } else {
            // 否则任务完成，从队列移除。
            pop(taskQueue);
        }
        currentTask = peek(taskQueue);
    }
    // 如果还有任务，返回 true，调度下一帧；否则返回 false
    if (currentTask !== null) {
        return true;
    }
    return false;
}

// 判断本帧是否已经用完时间片，决定是否让出主线程。
function shouldYieldToHost() {
    const timeElapsed = getCurrentTime() - startTime;
    if (timeElapsed < frameInterval) {
        return false;
    }
    return true;
}

export { 
    NormalPriority as unstable_NormalPriority, 
    unstable_scheduleCallback,
    shouldYieldToHost as unstable_shouldYield
};

// 此处有优先队列执行调度
// export function scheduleCallback(callback) {
//     requestIdleCallback(callback);
// }
