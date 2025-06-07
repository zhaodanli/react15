/** 创建带有优先级的事件监听器包装函数。
 * 事件触发时，分发到 React 的事件系统。
 * @param {*} targetContainer 
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @returns 
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
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

/** 这里简单打印，实际实现会进行事件合成和冒泡等处理。
 * @param {*} domEventName 
 * @param {*} eventSystemFlags 
 * @param {*} targetContainer 
 * @param {*} nativeEvent 
 */
export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    console.log("dispatchEvent", domEventName, eventSystemFlags, targetContainer, nativeEvent);
}