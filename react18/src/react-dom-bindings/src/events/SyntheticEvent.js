import assign from "shared/assign";

/** 这段代码实现了 React 的合成事件（SyntheticEvent）系统的核心部分。
 * 将原生浏览器事件包装成一个跨浏览器一致的“合成事件”对象，并提供统一的事件方法和属性。
 * @returns 
 */
function functionThatReturnsTrue() {
    return true;
}
function functionThatReturnsFalse() {
    return false;
}



/** 合成事件工厂
 * createSyntheticEvent 是一个工厂函数，传入事件接口 如 MouseEventInterface），返回一个合成事件构造函数。
 * @param {*} Interface 
 * @returns 
 */
function createSyntheticEvent(Interface) {
    function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
        this._reactName = reactName;
        this.type = reactEventType;
        this._targetInst = targetInst;
        this.nativeEvent = nativeEvent;
        this.target = nativeEventTarget;
        // 构造函数会把原生事件的属性（如 clientX、clientY）拷贝到合成事件对象上。
        for (const propName in Interface) {
            if (!Interface.hasOwnProperty(propName)) {
                continue;
            }
            this[propName] = nativeEvent[propName];
        }
        this.isDefaultPrevented = functionThatReturnsFalse;
        this.isPropagationStopped = functionThatReturnsFalse;
        return this;
    }

    /** 合成事件原型方法
     * 给合成事件对象添加 preventDefault 和 stopPropagation 方法，保证跨浏览器一致性。
     * 设置 isDefaultPrevented 和 isPropagationStopped 标记，方便后续判断。
     *  */ 
    assign(SyntheticBaseEvent.prototype, {
        preventDefault() {
            const event = this.nativeEvent;
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
            this.isDefaultPrevented = functionThatReturnsTrue;
        },
        stopPropagation() {
            const event = this.nativeEvent;
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
            this.isPropagationStopped = functionThatReturnsTrue;
        },
    });
    return SyntheticBaseEvent;
}

// 合成鼠标事件
// 定义了鼠标事件需要的属性（如 clientX、clientY）。
const MouseEventInterface = {
    clientX: 0,
    clientY: 0,
};

// SyntheticMouseEvent 就是一个合成鼠标事件构造函数。
export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);