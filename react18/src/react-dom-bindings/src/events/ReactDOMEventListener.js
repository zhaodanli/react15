import getEventTarget from "./getEventTarget.js";
import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree.js";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem.js";
import { DiscreteEventPriority, ContinuousEventPriority, DefaultEventPriority,
    getCurrentUpdatePriority, setCurrentUpdatePriority
 } from 'react-reconciler/src/ReactEventPriorities.js';

/** 创建带有优先级的事件监听器包装函数。
 * 事件触发时，分发到 React 的事件系统。
 * @param {*} targetContainer 
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @returns 
 * 用户点击 ->>>> createEventListenerWrapperWithPriority --->>>>> dispatchDiscreteEvent ->>>> dispatchEventForPluginEventSystem
 * --> dispatchEventsForPlugins ->>> extractEvents (如 SimpleEventPlugin.extractEvents）会根据事件类型、Fiber 树结构，收集所有相关的事件监听函数（如 onClick），并组装成 dispatchQueue。)
 * ->>> processDispatchQueue ---> executeDispatch(调用监听) --->  调用用户的事件处理函数（如 onClick） -->>> setState
 * ----> dispatchSetState --> 内部会读取当前的“事件优先级”，并据此分配 lane（如 DiscreteEventPriority → SyncLane）
 * ---->>>> 生成 update 对象，插入 Fiber 的 updateQueue。 ----> scheduleUpdateOnFiber 根据 lane/优先级决定同步还是异步调度。
 * DOM 事件触发
    * createEventListenerWrapperWithPriority → dispatchDiscreteEvent
 * 事件分发
    * dispatchDiscreteEvent → dispatchEvent → dispatchEventForPluginEventSystem → dispatchEventsForPlugins → extractEvents → processDispatchQueue → executeDispatch
 * 用户事件处理
    * onClick → setState/dispatchSetState
 * 状态更新
    * dispatchSetState（读取当前事件优先级，分配 lane，插入 updateQueue，调度
 */

/** 返回一个包装后的监听函数，实际会调用 dispatchDiscreteEvent。
 * @param {*} targetContainer 
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @returns 
 */
export function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
    const listenerWrapper = dispatchDiscreteEvent;
    return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
}

/** 事件触发时，调用 dispatchEvent 进行分发。
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} container 
 * @param {*} nativeEvent 
 */
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    // dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
    // 获取老的更新优先级
    const previousPriority = getCurrentUpdatePriority();
    try {
        // 将当前优先级设置为 离线更新优先级
        setCurrentUpdatePriority(DiscreteEventPriority);
        dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent)
    }finally {
        // 改回成原来的值
        setCurrentUpdatePriority(previousPriority);
    }
}

/** 这里简单打印，实际实现会进行事件合成和冒泡等处理。
 * 将事件委托给容器，在这里处理事件回调和冒泡
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} targetContainer 
 * @param {*} nativeEvent 
 */
export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    // console.log("dispatchEvent", domEventName, eventSystemFlags, targetContainer, nativeEvent);
    const nativeEventTarget = getEventTarget(nativeEvent); // 获取目标事件
    const targetInst = getClosestInstanceFromNode(nativeEventTarget);
    // 派发
    dispatchEventForPluginEventSystem(
        domEventName, // click
        eventSystemFlags, // 捕获活着冒泡
        nativeEvent, // 原生事件
        targetInst, // dom 对应 fiber
        targetContainer // 目标容器
    );
}

// 通过事件名拿到优先级
export function getEventPriority(domEventName) {
    switch (domEventName) {
        // case 连续/离散/默认事件
        case 'click':
            return DiscreteEventPriority;
        case 'drag':
            return ContinuousEventPriority;
        default:
            return DefaultEventPriority;
    }
}