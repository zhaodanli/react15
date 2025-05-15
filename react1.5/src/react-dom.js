import { REACT_TEXT, REACT_FORWARD_REF_TYPE } from "./constants";
import { addEvent } from "./event";

/**
 * 1. 虚拟DOM 编程 真实DOM
 * 2. 插入到父节点容器中
 */
function render(vdom, container) {
    // 1. 创建一个根节点
    const newDOM = createDOM(vdom);
    // 2. 将根节点添加到容器中
    container.appendChild(newDOM);
    // 真实 dom 操作
    if(newDOM.componentDidMount) {
        // 3. 调用组件的componentDidMount方法
        newDOM.componentDidMount();
    }
}

export function createDOM(vdom) {
    let { type, props, ref } = vdom;
    let dom;

    if(type === REACT_TEXT) {
        dom = document.createTextNode(props);
    }else if(type && type.$$typeof === REACT_FORWARD_REF_TYPE) {
        return mountForwardComponent(vdom);
    }else if(typeof type === 'function') {
        // 处理类组件
        if(type.isReactComponent){
            return mountClassComponent(vdom);
        }
        // 处理函数组件
        return mountFunctionComponent(vdom);
    }else{
        dom = document.createElement(type);
    }

    // 处理属性
    if(typeof props === 'object') {
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
    if(ref) {
        // 将DOM元素挂载到ref上
        ref.current = dom;
    }
    return dom;
}

function mountForwardComponent(vdom) {
    let { type, props, ref } = vdom;
    let renderVdom = type.render(props, ref);
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
}

function mountClassComponent(vdom) {
    const { type: ClassComponent, props, ref } = vdom;
    // 1. 创建一个类组件
    const classInstance = new ClassComponent(props);
    if(classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }
    if(ref) {
        ref.current = classInstance;
    }
    // 2. 调用类组件的render方法
    const renderVdom = classInstance.render();
    // if(classInstance.componentDidMount) {
    //     classInstance.componentDidMount();
    // }
    // 4. 将类组件的实例挂载到虚拟DOM上
    vdom.classInstance = classInstance;
    classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;
    // 3. 创建DOM元素 生成虚拟 DOM
    let dom = createDOM(renderVdom);
    if(classInstance.componentDidMount) {
        dom.componentDidMount = classInstance.componentDidMount.bind(classInstance);
    }
    return dom;
}
function mountFunctionComponent(vdom) {
    const { type, props } = vdom;
    // 1. 创建一个函数组件
    const renderVdom = type(props);
    vdom.oldRenderVdom = renderVdom;
    return createDOM(renderVdom);
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
        }else if(/^on[A-Z]/.test(key)) {
            // 处理事件
            // const eventName = key.toLowerCase().substring(2);
            // dom.addEventListener(eventName, newProps[key]);
            // dom[key.toLowerCase()] = newProps[key];
            addEvent(dom, key.toLowerCase(), newProps[key]);
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

export function findDOM(vdom) {
    if(!vdom) return null;
    if(vdom.dom) {
        return vdom.dom;
    }else {
        let renderVdom = vdom.classInstance ? vdom.classInstance.oldRenderVdom : vdom.oldRenderVdom;
        return findDOM(renderVdom);
    }
}

export function compareTwoVdom(parentDOM, oldVdom, newVdom, nextDOM) {
    // let oldDOM = findDOM(oldVdom);
    // let newDOM = createDOM(newVdom);
    // parentDOM.replaceChild(newDOM, oldDOM);
    if(!oldVdom && !newVdom) {
        return;
    }else if(!!oldVdom && !newVdom) {
        unMountVdom(oldVdom);
    } else if(!oldVdom && !!newVdom) {
        // 1. 如果没有旧的虚拟DOM，直接创建新的虚拟DOM
        let newDOM = createDOM(newVdom);
        
        if (nextDOM) {
            parentDOM.insertBefore(newDOM, nextDOM);
        }else {
            parentDOM.appendChild(newDOM);
        }

        if(newDOM.componentDidMount) {
            newDOM.componentDidMount();
        }
    } else if(!!oldVdom && !!newVdom && oldVdom.type !== newVdom.type) {
        unMountVdom(oldVdom);
        let newDOM = createDOM(newVdom);
        parentDOM.appendChild(newDOM);
        if (newDOM.componentDidMount) newDOM.componentDidMount();
    } else {
        updateElement(oldVdom, newVdom);
    }
}

/**
 * 
 * @param {新老节点深度对比} oldVdom 
 * @param {*} newVdom 
 * @returns 
 */
function updateElement(oldVdom, newVdom) {
    if (oldVdom.type === REACT_TEXT) {
        let currentDOM = newVdom.dom = findDOM(oldVdom);
        if (oldVdom.props !== newVdom.props) {
            // 如果文本节点的内容不一样，直接替换
            currentDOM.textContent = newVdom.props;
        }
    } else if (typeof oldVdom.type === 'string') {
        let currentDOM = newVdom.dom = findDOM(oldVdom);
        updateProps(currentDOM, oldVdom.props, newVdom.props);
        updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
    } else if (typeof oldVdom.type === 'function') {
        if (oldVdom.type.isReactComponent) {
            // 类组件
            updateClassComponent(oldVdom, newVdom);
        } else {
            // 函数组件
            updateFunctionComponent(oldVdom, newVdom);
        }
    }
    
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {
    oldVChildren = (Array.isArray(oldVChildren)) ? oldVChildren : [oldVChildren];
    newVChildren = (Array.isArray(newVChildren)) ? newVChildren : [newVChildren];
    let maxLength = Math.max(oldVChildren.length, newVChildren.length);
    for(let i=0; i<maxLength; i++) {
        let nextVDOM = oldVChildren.find((item, index)=> index>i && item && findDOM(item))
        compareTwoVdom(parentDOM, oldVChildren[i],newVChildren[i], findDOM(nextVDOM))
    }
}

function updateClassComponent(oldVdom, newVdom) {
    let classInstance = newVdom.classInstance = oldVdom.classInstance;
    if(classInstance.componentWillReceiveProps) {
        classInstance.componentWillReceiveProps(newVdom.props)
    }

    classInstance.updater.emitUpdate(newVdom.props);
}

function updateFunctionComponent(oldVdom, newVdom) {
    let currentDOM = findDOM(oldVdom);
    if (!currentDOM) return;
    let { type, props } = newVdom;
    let newRenderVdom = type(props);
    compareTwoVdom(currentDOM.parentNode, oldVdom.oldRenderVdom, newRenderVdom);
    newVdom.oldRenderVdom = newRenderVdom;
}

function unMountVdom(vdom) {
    if(!vdom) return;
    let { type, props, ref, classInstance } = vdom;
    let currentDOM = findDOM(vdom); // 获取此虚拟DOM对应的真实DOM

    if (classInstance && classInstance.componentWillUnmount) {
        classInstance.componentWillUnmount();
    }

    if (ref) {
        ref.current = null;
    }

    // 如果此虚拟DOM有子节点的话，递归全部删除
    if (props.children) {
        // 得到儿子的数组
        let children = Array.isArray(props.children) ? props.children : [props.children];
        children.forEach(unMountVdom);
    }

    // 把自己这个虚拟DOM对应的真实DOM从界面删除
    if (currentDOM) currentDOM.remove();
}
const ReactDOM = {
    render,
}
export default ReactDOM