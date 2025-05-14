import { updateQueue } from './Component';

/**
 * 事件委托，
 * @param {} dom 
 * @param {*} eventType 
 * @param {*} handler 
 */
export function addEvent(dom, eventType, handler) {
    let store = dom._store_ || (dom._store_ = {});
    store[eventType] = handler;

    // 事件委托，代理到文档对象上
    if(!document[eventType]) {
        document[eventType] = dispatchEvent
    }
    dom.addEventListener(eventType, handler);
}

/**
 * 委托给事件对象的处理函数
 * @param {*} event  原生事件对象 浏览器给的
 */
function dispatchEvent(event) {
    let { target, type } = event;
    const eventType = `on${type}`;

    const { _store_ } = target;

    // 方法结束前设置标识
    updateQueue.isBatchingUpdate = true;
    let handler = _store_ && _store_[eventType];
    handler && handler(event)

    // 方法结束后批量更新
    updateQueue.batchUpdater();
}