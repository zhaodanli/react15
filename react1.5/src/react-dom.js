import { REACT_TEXT } from "./constants";

/**
 * 1. 虚拟DOM 编程 真实DOM
 * 2. 插入到父节点容器中
 */
function render(vdom, container) {
    // 1. 创建一个根节点
    const newDOM = createDOM(vdom);
    // 2. 将根节点添加到容器中
    container.appendChild(newDOM);
}

export function createDOM(vdom) {
    let { type, props } = vdom;
    let dom;

    if(type === REACT_TEXT) {
        dom = document.createTextNode(props);
    }else {
        dom = document.createElement(type);
    }

    // 处理属性
    if(props) {
        updateProps(dom, {}, props);
        if(props.children && typeof props.children === 'object' && props.children.$$typeof) {
            // 递归处理子元素
            render(props.children, dom);
        }else if(Array.isArray(props.children)) {
            // 处理数组节点
            reconcileChildren(props.children, dom);
        // }else if(typeof props.children === 'string' || typeof props.children === 'number') {
        //     dom.textContent = props.children;
        }
    }
    vdom.dom = dom;
    return dom;
}

function updateProps(dom, oldProps, newProps) {
    for (let key in newProps) {
        // 添加新的属性
        if(key === 'children') {
            // 处理子元素 单独处理，不再这里处理
            continue;
        }else if(key === 'style') {
            // 处理样式
            let styleObj = newProps[key];
            for (let attr in styleObj) {
                dom.style[attr] = styleObj[attr];
            }
        }else if(key.startsWith('on')) {
            // 处理事件
            const eventName = key.toLowerCase().substring(2);
            dom.addEventListener(eventName, newProps[key]);
        }else {
            // 处理其他属性
            dom[key] = newProps[key];
        }
    }
    for (let key in oldProps) {
        // 删除旧的属性
        if (!newProps.hasOwnProperty(key)) {
            dom[key] = null;
        }
    }
}

function reconcileChildren(childrenVdom, parentDOM) {
    for (let i = 0; i < childrenVdom.length; i++) {
        render(childrenVdom[i], parentDOM);
    }
}
const ReactDOM = {
    render,
    createDOM
}
export default ReactDOM