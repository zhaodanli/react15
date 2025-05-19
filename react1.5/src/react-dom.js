import { REACT_TEXT, REACT_FORWARD_REF_TYPE, REACT_FRAGMENT, PLACEMENT, MOVE, REACT_PROVIDER, REACT_CONTEXT, REACT_MEMO } from "./constants";
import { addEvent } from "./event";

/** 多次渲染状态不变 */
/** 
 * hookIndex 的作用：
    用于跟踪当前 Hook 的调用顺序，确保状态值按照正确的顺序存储和读取。
    scheduleUpdate 重置 hookIndex 为 0 的原因：

    每次重新渲染时，需要从头开始执行所有 Hook，确保状态值正确读取。
    scheduleUpdate 传两个相同 vdom 的更新机制：

    即使 vdom 是同一个对象，compareTwoVdom 会递归检查虚拟 DOM 树的子节点，找到需要更新的部分并更新真实 DOM。
*/
let hookStates = []; // 状态
let hookIndex = 0; // 当前索引
let scheduleUpdate;

/**
 * 1. 虚拟DOM 编程 真实DOM
 * 2. 插入到父节点容器中
 */

function render(vdom, container) {
    mount(vdom, container);
    scheduleUpdate = () => {
      hookIndex = 0;
      compareTwoVdom(container,vdom,vdom);
    }
}

function mount(vdom, container) {
    // 1. 创建一个根节点
    const newDOM = createDOM(vdom);
    if (newDOM) {
        // 2. 将根节点添加到容器中
        container.appendChild(newDOM);
        // 真实 dom 操作
        if(newDOM.componentDidMount) {
            // 3. 调用组件的componentDidMount方法
            newDOM.componentDidMount();
        }
    }
}

export function useState(initialState){
    return useReducer(null, initialState)
    // hookStates[hookIndex] = hookStates[hookIndex] || initialState;
    // let currentIndex = hookIndex; 
    // function setState(action){
    //     let newState = typeof action === 'function' ? action() : action;
    //     hookStates[currentIndex] = newState;
    //     scheduleUpdate(); // 触发重新渲染
    // }
    // return [hookStates[hookIndex++], setState];
}

export function createDOM(vdom) {
    let { type, props, ref } = vdom;
    let dom;

    if (type && type.$$typeof === REACT_MEMO) {
        return mountMemoComponent(vdom);
    }else if (type && type.$$typeof === REACT_PROVIDER) {
        return mountProviderComponent(vdom)
    } else if (type && type.$$typeof === REACT_CONTEXT) {
        return mountContextComponent(vdom)
    } else if(type === REACT_TEXT) {
        dom = document.createTextNode(props);
    }else if(type === REACT_FRAGMENT) {
        dom = document.createDocumentFragment();
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
            mount(props.children, dom);
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

function mountMemoComponent(vdom) {
    let { type: { type: functionComponent}, props } = vdom;
    let renderVdom = functionComponent(props);
    vdom.oldRenderVdom = renderVdom;
    if (!renderVdom) return null;  
    return createDOM(renderVdom)
}

/** 
 * 把属性值放在 Provider._currentValue 上
 * 渲染子节点
 * */
function mountProviderComponent(vdom) {
    let { type, props } = vdom;
    let context = type._context;
    context._currentValue = props.value;
    let renderVdom = props.children;
    vdom.oldRenderVdom = renderVdom;
    if (!renderVdom) return null;  
    return createDOM(renderVdom);
}

function mountContextComponent(vdom) {
    let { type, props } = vdom;
    let context = type._context;
    let renderVdom = props.children(context._currentValue);
    vdom.oldRenderVdom = renderVdom;
    if (!renderVdom) return null;  
    return createDOM(renderVdom);
}

function mountForwardComponent(vdom) {
    let { type, props, ref } = vdom;
    let renderVdom = type.render(props, ref);
    vdom.oldRenderVdom = renderVdom;
    if (!renderVdom) return null;  
    return createDOM(renderVdom);
}

function mountClassComponent(vdom) {
    const { type: ClassComponent, props, ref } = vdom;
    // 1. 创建一个类组件
    const classInstance = new ClassComponent(props);
    if(ClassComponent.contextType){
        classInstance.context = ClassComponent.contextType._currentValue;
    }
    if(classInstance.componentWillMount) {
        classInstance.componentWillMount();
    }
    if(ref) {
        ref.current = classInstance;
    }
    // 2. 调用类组件的render方法
    const renderVdom = classInstance.mount();
    // if(classInstance.componentDidMount) {
    //     classInstance.componentDidMount();
    // }
    // 4. 将类组件的实例挂载到虚拟DOM上
    vdom.classInstance = classInstance;
    classInstance.oldRenderVdom = vdom.oldRenderVdom = renderVdom;
    // 3. 创建DOM元素 生成虚拟 DOM

    if (!renderVdom) return null;  
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
    if (!renderVdom) return null;  
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
        childrenVdom[i].mountIndex = i;
        mount(childrenVdom[i], parentDOM);
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
    if (oldVdom.type && oldVdom.type.$$typeof === REACT_MEMO) {
        updateMemoComponent(oldVdom, newVdom);
    } else if (oldVdom.type.$$typeof === REACT_CONTEXT) {
        updateContextComponent(oldVdom, newVdom);
    } else if (oldVdom.type.$$typeof === REACT_PROVIDER) {
        updateProviderComponent(oldVdom, newVdom);
    } else if (oldVdom.type === REACT_TEXT) {
        let currentDOM = newVdom.dom = findDOM(oldVdom);
        if (oldVdom.props !== newVdom.props) {
            // 如果文本节点的内容不一样，直接替换
            currentDOM.textContent = newVdom.props;
        }
    }else if(oldVdom.type === REACT_FRAGMENT) {
        let currentDOM = newVdom.dom = findDOM(oldVdom);
        updateChildren(currentDOM, oldVdom.props.children, newVdom.props.children);
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

function updateMemoComponent(oldVdom, newVdom) {
    let { type: { type: functionComponent, compare} } = oldVdom;
    if (!compare(oldVdom.props, newVdom.props)) {
        const oldDOM = findDOM(oldVdom);
        const parentDOM = oldDOM.parentNode;
        let renderVdom = functionComponent(newVdom.props);
        compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
        newVdom.oldRenderVdom = renderVdom;
    } else {
        newVdom.oldRenderVdom = oldVdom.oldRenderVdom;
    }
}

function updateProviderComponent(oldVdom, newVdom) {
    let parentDOM = findDOM(oldVdom).parentNode;
    let { type, props } = newVdom;
    let context = type._context;
    context._currentValue = props.value
    let renderVdom = props.children;
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
    newVdom.oldRenderVdom = renderVdom;
}
function updateContextComponent(oldVdom, newVdom) {
    let parentDOM = findDOM(oldVdom).parentNode;
    let { type, props } = newVdom;
    let context = type._context;
    let renderVdom = props.children(context._currentValue);
    compareTwoVdom(parentDOM, oldVdom.oldRenderVdom, renderVdom);
    newVdom.oldRenderVdom = renderVdom;
}

function updateChildren(parentDOM, oldVChildren, newVChildren) {
    oldVChildren = ((Array.isArray(oldVChildren)) ? oldVChildren : [oldVChildren]).filter(item => typeof item !== 'undefined' && item !== null);
    newVChildren = ((Array.isArray(newVChildren)) ? newVChildren : [newVChildren]).filter(item => typeof item !== 'undefined' && item !== null);
    
    let keyedOldMap = {};
    let lastPlacedIndex = 0;
    oldVChildren.forEach((oldVChild, index) => {
        let oldKey = oldVChild.key ? oldVChild.key : index;
        keyedOldMap[oldKey] = oldVChild;
    });
    let patch = [];
    newVChildren.forEach((newVChild, index) => {
        newVChild.mountIndex = index;
        let newKey = newVChild.key ? newVChild.key : index;
        let oldVChild = keyedOldMap[newKey];
        if (oldVChild) {
            // 更新节点
            updateElement(oldVChild, newVChild);
            if (oldVChild.mountIndex < lastPlacedIndex) {
                patch.push({
                    type: MOVE,
                    oldVChild,
                    newVChild,
                    mountIndex: index
                });
            }

            delete keyedOldMap[newKey];
            lastPlacedIndex = Math.max(lastPlacedIndex, oldVChild.mountIndex);
        } else {
            patch.push({
                type: PLACEMENT,
                newVChild,
                mountIndex: index
            });
        }
    });
    let moveVChild = patch.filter(action => action.type === MOVE).map(action => action.oldVChild);
    // 把要移动的 和 要删除的 全部删除
    Object.values(keyedOldMap).concat(moveVChild).forEach((oldVChild) => {
        let currentDOM = findDOM(oldVChild);
        parentDOM.removeChild(currentDOM);
    });
    // 处理新增和移动
    patch.forEach(action => {
        let { type, oldVChild, newVChild, mountIndex } = action;
        // 老的真实DOM节点集合
        let childNodes = parentDOM.childNodes;
        if (type === PLACEMENT) {
            let newDOM = createDOM(newVChild);
            let childNode = childNodes[mountIndex];
            if (childNode) {
                parentDOM.insertBefore(newDOM, childNode);
            } else {
                parentDOM.appendChild(newDOM);
            }
        } else if (type === MOVE) {
            let oldDOM = findDOM(oldVChild);
            let childNode = childNodes[mountIndex];
            if (childNode) {
                parentDOM.insertBefore(oldDOM, childNode);
            } else {
                parentDOM.appendChild(oldDOM);
            }
        }
    });
    //     let maxLength = Math.max(oldVChildren.length, newVChildren.length);
    //     for(let i=0; i<maxLength; i++) {
    //         let nextVDOM = oldVChildren.find((item, index)=> index>i && item && findDOM(item))
    //         compareTwoVdom(parentDOM, oldVChildren[i],newVChildren[i], findDOM(nextVDOM))
    //     }
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

export  function useMemo(factory,deps){
    if(hookStates[hookIndex]){
        let [ lastMemo,lastDeps ] = hookStates[hookIndex]; // 获取上一次的 memo 和依赖数组
        let same = deps.every((item,index)=> (item === lastDeps[index])); // 比较当前依赖数组 deps 和上一次的依赖数组 lastDeps 是否完全相同。
        if(same){
            hookIndex++; 
            return lastMemo; // 如果依赖数组相同，直接返回上一次的 memo
        }else{
            let newMemo = factory(); // 如果依赖数组不同，重新计算 memo
            hookStates[hookIndex++]=[newMemo,deps]; // 更新 memo 和依赖数组
            return newMemo;
        }
    }else{
        let newMemo = factory(); // 第一次调用时，计算 memo
        hookStates[hookIndex++]=[newMemo,deps]; // 存储 memo 和依赖数组
        return newMemo;
    }
}

export function useCallback(callback,deps){
    if(hookStates[hookIndex]){
        let [lastCallback,lastDeps] = hookStates[hookIndex]; // 获取上一次的回调函数和依赖数组
        let same = deps.every((item,index)=>item === lastDeps[index]); // 比较当前依赖数组和上一次的依赖数组是否完全相同
        if(same){
            hookIndex++; // 如果依赖数组相同，直接返回上一次的回调函数
            return lastCallback;
        }else{
            hookStates[hookIndex++]=[callback,deps]; // 如果依赖数组不同，更新回调函数和依赖数组
            return callback;
        }
    }else{
        hookStates[hookIndex++]=[callback,deps]; // 第一次调用时，存储回调函数和依赖数组
        return callback;
    }
}

export function useReducer(reducer, initialState){
    hookStates[hookIndex] =  hookStates[hookIndex] || initialState; // 只存 state
    let currentIndex = hookIndex;

    function dispatch(action) {
        //1.获取老状态
        let oldState = hookStates[currentIndex];
        //如果有reducer就使用reducer计算新状态
        if (reducer) {
            let newState = reducer(oldState, action);
            hookStates[currentIndex] = newState;
        } else {
            //判断action是不是函数，如果是传入老状态，计算新状态
            let newState = typeof action === 'function' ? action(oldState) : action;
            hookStates[currentIndex] = newState;
        }
        scheduleUpdate();
    }
    return [ hookStates[hookIndex++], dispatch];
}

export function useEffect(callback,dependencies){
    let currentIndex = hookIndex;
    if(hookStates[hookIndex]) {
        let [destroy,lastDeps] = hookStates[hookIndex]; // 获取上一次的清理函数和依赖数组
        let same = dependencies && dependencies.every((item,index) => item === lastDeps[index] ); // 比较依赖数组是否相同
        if(same) {
            hookIndex++; // 如果依赖数组相同，跳过执行
        } else {
            destroy && destroy(); // 如果依赖数组不同，执行上一次的清理函数
            setTimeout(()=>{
                hookStates[currentIndex] = [ callback(), dependencies ]; // 执行 callback 并存储返回的清理函数和新的依赖数组
            })
            hookIndex++;
        }
    } else {
        setTimeout(() => {
            setTimeout(()=>{
                hookStates[currentIndex] = [ callback(), dependencies ]; // 第一次执行 callback 存储清理函数和依赖数组
            })
        })
        hookIndex++;
    }
}

export function useLayoutEffect(callback,dependencies) {
    let currentIndex = hookIndex;
    if(hookStates[hookIndex]) {
        let [destroy,lastDeps] = hookStates[hookIndex]; // 获取上一次的清理函数和依赖数组
        let same = dependencies && dependencies.every((item,index) => item === lastDeps[index] ); // 比较依赖数组是否相同
        if(same) {
            hookStates++; // 如果依赖数组相同，跳过执行
        } else {
            destroy && destroy(); // 如果依赖数组不同，执行上一次的清理函数
            queueMicrotask(()=>{
                hookStates[currentIndex] = [ callback(), dependencies ]; // 执行 callback 并存储返回的清理函数和新的依赖数组
            })
            hookIndex++;
        }
    } else {
        queueMicrotask(()=>{
            hookStates[currentIndex] = [ callback(), dependencies ]; // 执行 callback 并存储返回的清理函数和新的依赖数组
        })
        hookIndex++;
    }
}

export function useRef(initialState) {
    hookStates[hookIndex] =  hookStates[hookIndex] || { current: initialState };
    return hookStates[hookIndex++];
}

export function useImperativeHandle(ref, handler) {
    ref.current = handler();
}

const ReactDOM = {
    render,
    createPortal: render,
    useState
}
export default ReactDOM