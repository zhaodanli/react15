import { registerSimpleEvents, topLevelEventsToReactNames } from "../DOMEventProperties";
import { SyntheticMouseEvent } from "../SyntheticEvent.js";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";


/** 将原生事件（如 click）转换为 React 的合成事件，并收集对应的事件监听函数，最终推入事件分发队列。
 * 事件系统的提取阶段，每当有原生事件发生时，都会调用这个函数。
 * 把原生事件包装成 React 合成事件，并收集所有监听函数，准备后续的事件分发和处理。
 * 
 * @param {事件分发队列，最终所有需要派发的事件都会被推入这里} dispatchQueue 
 * @param {原生事件名（如 "click"）} domEventName 
 * @param {事件目标对应的 Fiber 实例} targetInst 
 * @param {原生事件对象} nativeEvent 
 * @param {原生事件的目标 DOM 节点} nativeEventTarget 
 * @param {事件系统标志位（如是否捕获阶段）} eventSystemFlags 
 */
function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags) {
    // topLevelEventsToReactNames 用于将原生事件名（如 "click"）映射为 React 事件名（如 "onClick"）。
    // 将原生事件名映射为 React 事件名
    const reactName = topLevelEventsToReactNames.get(domEventName);
    let SyntheticEventCtor;

    // 选择合成事件构造器
    switch (domEventName) {
        case "click":
            SyntheticEventCtor = SyntheticMouseEvent;
            break;
        default:
            break;
    }

    // 判断事件阶段
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    // 收集监听函数 累加单阶段监听 从目标 Fiber 开始，向上收集所有相关的事件监听函数（如 onClick）。
    const listeners = accumulateSinglePhaseListeners(targetInst, reactName, nativeEvent.type, inCapturePhase);
    // 生成合成事件并入队 如果有监听函数，创建合成事件对象，并将事件和监听函数一起推入分发队列
    if (listeners.length > 0) {
        const event = new SyntheticEventCtor(reactName, domEventName, targetInst, nativeEvent, nativeEventTarget);
        dispatchQueue.push({
            event, // 合成事件实例
            listeners, // 事件监听函数数组
            // domEventName, // 原生事件名
            // targetInst, // 目标实例
            // nativeEvent, // 原生事件对象
            // nativeEventTarget, // 原生事件目标
            // eventSystemFlags, // 事件系统标志
            // inCapturePhase, // 是否在捕获阶段
            // reactName // React 事件名
        });
    }
}

/**
 * 事件注册 用于注册所有简单事件
 * topLevelEventsToReactNames 用于将原生事件名（如 "click"）映射为 React 事件名（如 "onClick"）。
 */
export { registerSimpleEvents as registerEvents, extractEvents };