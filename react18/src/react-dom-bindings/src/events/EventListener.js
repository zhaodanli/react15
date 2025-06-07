/** 封装原生的 addEventListener，分别用于捕获和冒泡阶段。
 * true 表示捕获阶段，false 表示冒泡阶段。
 * @param {*} target 
 * @param {*} eventType 
 * @param {*} listener 
 * @returns 
 */
export function addEventCaptureListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, true);
  return listener;
}

export function addEventBubbleListener(target, eventType, listener) {
  target.addEventListener(eventType, listener, false);
  return listener;
}