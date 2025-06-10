import { allNativeEvents } from "./EventRegistry.js";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin.js";

import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener.js";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags.js";
import { addEventCaptureListener, addEventBubbleListener } from "./EventListener.js";

import getEventTarget from "./getEventTarget.js";
import getListener from "./getListener.js";
import { HostComponent } from "react-reconciler/src/ReactWorkTags.js";


/** 事件注册：在根容器上为所有支持的事件类型注册捕获和冒泡监听器（事件委托）。
 * 注册所有原生事件（如 click、input 等）。
 * 在根容器上统一绑定事件监听器（事件委托）。
 * 事件触发时，将事件分发到 React 的事件系统。
 */
// 注册事件名
SimpleEventPlugin.registerEvents();
const listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);

/** 遍历所有原生事件名，分别在捕获和冒泡阶段注册监听。
 * 
 * @param {*} rootContainerElement 
 */
export function listenToAllSupportedEvents(rootContainerElement) {
    console.log("listenToAllSupportedEvents >>>>>>>>>>>>>>>", allNativeEvents)
    if (!rootContainerElement[listeningMarker]) {
        // 如果没有标记，说明还没有注册过事件监听
        rootContainerElement[listeningMarker] = true;
        allNativeEvents.forEach((domEventName) => {
            listenToNativeEvent(domEventName, true, rootContainerElement);
            listenToNativeEvent(domEventName, false, rootContainerElement);
        });
    }
}

/** 事件监听：监听器是包装过的，会把事件传递给 React 的事件系统。
 * 根据是否捕获阶段设置标志位，然后调用 addTrappedEventListener。
 * @param {*} domEventName 
 * @param {*} isCapturePhaseListener 
 * @param {*} target 
 */
export function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
    let eventSystemFlags = 0; // 冒泡 = 0 捕获 = 4
    if (isCapturePhaseListener) {
        eventSystemFlags |= IS_CAPTURE_PHASE;
    }

    // 添加捕获监听
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

/** 事件分发：事件触发时，统一由 React 的分发函数处理，保证事件机制和优先级一致。
 * 创建事件监听器包装函数，并根据阶段用不同的方式注册到 DOM 上。
 * @param {*} targetContainer 
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} isCapturePhaseListener 
 */
function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
    if (isCapturePhaseListener) {
        addEventCaptureListener(targetContainer, domEventName, listener);
    } else {
        addEventBubbleListener(targetContainer, domEventName, listener);
    }
}

/** dispatchEvent 最终派发的事件 
 */
export function dispatchEventForPluginEventSystem(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    targetInst,
    targetContainer
) {
    dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer);
}

function dispatchEventsForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    const nativeEventTarget = getEventTarget(nativeEvent);
    const dispatchQueue = []; // dom 上的 props 上的 click
    // 提取事件
    extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer
    );
    console.log("dispatchQueue", dispatchQueue);
    processDispatchQueue(dispatchQueue, eventSystemFlags);
}

export function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;

    for (let i = 0; i < dispatchQueue.length; i++) {
        const { event, listeners } = dispatchQueue[i];
        processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
    }
}

function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
    // 这里可以根据需要处理事件的顺序
    // 目前只是简单遍历，实际应用中可能需要根据优先级等进行排序
    if (inCapturePhase) {
        for (let i = dispatchListeners.length - 1; i >= 0; i--) {
            const { currentTarget, listener } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return; // 如果事件传播被停止，退出循环
            }
            // 调用监听函数
            executeDispatch(event, listener, currentTarget);
        }
    } else {
        for (let i = 0; i < dispatchListeners.length; i++) {
            const { currentTarget, listener } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return; // 如果事件传播被停止，退出循环
            }
            // 调用监听函数
            executeDispatch(event, listener, currentTarget);
        }
    }
}

// 执行事件分发，调用监听函数
function executeDispatch(event, listener, currentTarget) {
    event.currentTarget = currentTarget;
    listener(event);
    event.currentTarget = null;
}

function extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
) {
    SimpleEventPlugin.extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer
    );
}

/** 累加单阶段监听
 * 
 * @param {*} targetFiber 
 * @param {*} reactName 
 * @param {*} nativeEventType 
 * @param {*} inCapturePhase 
 * @returns 
 */
export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, inCapturePhase) {
    const captureName = reactName + "Capture";
    const reactEventName = inCapturePhase ? captureName : reactName;
    const listeners = [];
    let instance = targetFiber;
    while (instance !== null) {
        const { stateNode, tag } = instance;
        // 原生节点 且 节点存在
        if (tag === HostComponent && stateNode !== null) {
            if (reactEventName !== null) {
                const listener = getListener(instance, reactEventName);
                if (listener !== null && listener !== undefined) {
                    listeners.push(createDispatchListener(instance, listener, stateNode));
                }
            }
        }
        instance = instance.return;
    }
    return listeners;
}

// 把事件监听相关的信息（Fiber、监听函数、DOM 节点）打包成一个对象，方便后续事件分发时统一处理和调用。
function createDispatchListener(instance, listener, currentTarget) {
    return {
        instance,
        listener,
        currentTarget,
    };
}