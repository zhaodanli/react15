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

    let syntheticEvent = createSyntheticEvent(event);
    // 方法结束前设置标识
    updateQueue.isBatchingUpdate = true;
    
    let currentTarget = target;

    // 模拟事件冒泡，向上查找
    while (currentTarget) {
        syntheticEvent.currentTarget = currentTarget;
        let { _store_ } = currentTarget;
        let handler = _store_ && _store_[eventType];
        handler && handler(syntheticEvent);
        //在执行handler的过程中有可能会阻止冒泡
        if (syntheticEvent.isPropagationStopped) {
            break;
        }
        currentTarget = currentTarget.parentNode;
    }

    // 方法结束后批量更新
    updateQueue.batchUpdater();
}

function createSyntheticEvent(nativeEvent) {
    let syntheticEvent = {};

    // 将原生事件的属性和方法复制到合成事件对象中
    for(let key in nativeEvent) {
        let value = nativeEvent[key];
        if(typeof value === 'function') {
            value = value.bind(nativeEvent); // 确保方法的 this 指向原生事件
            syntheticEvent[key] = value;
        }
    }

    // 添加自定义属性和方法
    syntheticEvent.nativeEvent = nativeEvent; // 保存原生事件对象
    syntheticEvent.isDefaultPrevented = false; // 默认行为是否被阻止
    syntheticEvent.isPropagationStopped = false;  // 事件传播是否被停止
    syntheticEvent.preventDefault = preventDefault;
    syntheticEvent.stopPropagation = stopPropagation;

    return syntheticEvent;
}

function preventDefault() {
    this.isDefaultPrevented = true; // 标记默认行为已被阻止
    const event = this.nativeEvent; // 获取原生事件对象
    if (event.preventDefault) {
        event.preventDefault(); // 调用原生事件的 preventDefault 方法
    } else { // 兼容 IE 浏览器
        event.returnValue = false; // 设置 returnValue 为 false，阻止默认行为
    }
}
function stopPropagation() {
    this.isPropagationStopped = true;
    const event = this.nativeEvent;
    if (event.stopPropagation) {
        event.stopPropagation();
    } else { // 兼容 IE 浏览器
        event.cancelBubble = true;
    }
}