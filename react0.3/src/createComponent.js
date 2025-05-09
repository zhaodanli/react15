import $, { type } from 'jquery';
import types from './types';

let diffQueue = []; // diff 队列
let updateDepth = 0; // 更新深度

class Element {
    constructor({ type, props }) {
        this.type = type;
        this.props = props;
    }
}

function createElement(type, props={}, ...children) {
    props.children = children || []; // children 是 props的属性
    return new Element({ type, props }); 
}

function createComponent(element) {
    if(typeof element === 'string' || typeof element === 'number') {
        // 如果是字符串或者数字，直接渲染
        return new textComponent(element);
    } else if(element instanceof Element && typeof element.type === 'string') {
        // 有可能是 Counter 组件的名称， string 就一定是 标签类型
        // 如果是 Element 实例，创建对应的组件
        return new NativeComponent(element);
    } else if(element instanceof Element && typeof element.type === 'function') {
        // 如果是函数，创建对应的组件
        return new compositeComponent(element);
    }
}

class UnitComponent {
    constructor(element) {
        // 私有属性
        this._currentElement = element;
    }

    getHtmlString() {
        throw Error('getHtmlString() must be implemented');
    }
}


class textComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    getHtmlString(reactid) {
        this._reacteid = reactid;
        return  `<span data-reactid=${reactid}>${this._currentElement}</span>`;
    }

    update(nextElement) {
        // console.log('textComponent update');
        if(this._currentElement !== nextElement) {
            this._currentElement = nextElement;
            $(`[data-reactid="${this._reacteid}"]`).html(this._currentElement);
        }
    } 
}

/**
 * 原生 DOM 没有生命周期，不需要挂载
 */
class NativeComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    update(nextElement) {
        // console.log('NativeComponent update ============== ', nextElement);
        let oldProps = this._currentElement.props;
        let newProps = nextElement.props;

        // 更新属性
        this.updateDOMProperties(oldProps, newProps);
        // 更新子元素
        this.updateDOMChildren(nextElement.props.children);
    }

    // diff 儿子
    updateDOMChildren(newChildrenElement) {
        updateDepth++;
        // 处理子元素
        this.diff(diffQueue, newChildrenElement);
        updateDepth--;
        if(updateDepth === 0){
            // 如果是最外层的 diffQueue 处理
            // 处理 diffQueue
            this.patch(diffQueue);
            diffQueue = [];
        }
        console.log('diffQueue', diffQueue);
    }

    patch(diffQueue) {
        // 处理 diffQueue
        let deleteChildren = []; // 删除的元素
        let deleteMap = {}; // 能服用的节点
        for(let i=0; i<diffQueue.length; i++) {
            const difference = diffQueue[i];
            if(difference.type === types.REMOVE || difference.type === types.MOVE) {
                let fromIndex = difference.fromIndex;
                let oldChild = difference.parentNode.children().get(fromIndex);
                deleteMap[fromIndex] = oldChild;
                deleteChildren.push(oldChild);
            }
        }
        $.each(deleteChildren, (idx, item) => {
            // 删除元素
            $(item).remove();
        });

        for(let i=0; i<diffQueue.length; i++) {
            const difference = diffQueue[i];
            if(difference.type === types.MOVE || difference.type === types.INSERT) {
                switch (difference.type) {
                    case types.MOVE:
                        this.insertChildAt(difference.parentNode, difference.toIndex, $(deleteMap[difference.fromIndex]));
                        break;
                    case types.INSERT:
                        // 插入元素
                        this.insertChildAt(difference.parentNode, difference.toIndex, $(difference.markUp));
                        break;
                    default:
                        break;
                }
            }
        }
    }

    insertChildAt(parentNode, index, newNode) {
        let oldChild = parentNode.children().get(index);
        oldChild? newNode.insertBefore(oldChild): newNode.appendTo(parentNode);
    }

    diff(diffQueue, newChildrenElement) {
        // 已经渲染的 儿子节点的单元
        let oldChildrenComponentMap = this.getOldChildren(this._renderedChildrenComponent);
        let { newChildrenComponent, newChildrenComponentMap } = this.getNewChildren(oldChildrenComponentMap, newChildrenElement);

        let lastIndex = 0; // 上一个元素的索引 最后一个不需要动的索引
        for (let i = 0; i < newChildrenComponent.length; i++) {
            const newComponent = newChildrenComponent[i];
            let newKey = newComponent._currentElement.props && newComponent._currentElement.props.key || i.toString();
            let oldChildComponent = oldChildrenComponentMap[newKey];
            if(oldChildComponent === newComponent) { // 新老一致则复用
                // 如果是同一个元素，更新即可
                if(oldChildComponent._moutIndex < lastIndex) {
                    // 如果上一个元素的索引大于当前元素的索引，说明需要移动
                    diffQueue.push({
                        parentId: this._reacteid,
                        parentNode: $(`[data-reactid="${this._reacteid}"]`),
                        type: types.MOVE,
                        fromIndex: oldChildComponent._moutIndex,
                        toIndex: i,
                    });
                }
                lastIndex = Math.max(lastIndex, oldChildComponent._moutIndex);
            } else {
                // 没老的就是新的
                diffQueue.push({
                    parentId: this._reacteid,
                    parentNode: $(`[data-reactid="${this._reacteid}"]`),
                    type: types.INSERT,
                    toIndex: i,
                    markUp: newComponent.getHtmlString(`${this._reacteid}.${i}`),
                });
            }
            newComponent._moutIndex = i; // 记录当前元素的索引
        }

        for(let oldKey in oldChildrenComponentMap) {
            const oldChild = oldChildrenComponentMap[oldKey];
            if(!newChildrenComponentMap.hasOwnProperty(oldKey)) {
                // 如果老的有，新的没有，说明需要删除
                diffQueue.push({
                    parentId: this._reacteid,
                    parentNode: $(`[data-reactid="${this._reacteid}"]`),
                    type: types.REMOVE,
                    fromIndex: oldChild._moutIndex,
                });
            }
        }

    }

    getNewChildren(oldChildrenComponentMap, newChildrenElement) {
        let newChildrenComponent = [];
        let newChildrenComponentMap = {};
        newChildrenElement.forEach((newElement, index)=> {
            let newKey = newElement.props && newElement.props.key || index.toString();
            // 找到老的 UnitComponent
            let oldComponent = oldChildrenComponentMap[newKey];
            let oldElement = oldComponent && oldComponent._currentElement; // 获取老元素
            if (shouldDeepCompare(oldElement, newElement)) {
                // 如果元素类型一样，则深度比较，否则直接 replace
                // 6.如果可以深比较， 把更新工作交给上次渲染出的 element 元素对应的 component 来处理
                oldComponent.update(newElement);
                newChildrenComponent.push(oldComponent);
                newChildrenComponentMap[newKey] = oldComponent;
            } else {
                const nextComponent = createComponent(newElement);
                newChildrenComponent.push(nextComponent);
                newChildrenComponentMap[newKey] = oldComponent;
            }
        });
        return {
            newChildrenComponent,
            newChildrenComponentMap
        };
    }

    getOldChildren(childrenComponent) {
        let map = {};
        for(let i=0; i<childrenComponent.length; i++) {
            let child = childrenComponent[i];
            let key = child._currentElement.props && child._currentElement.props.key || i.toString();
            map[key] = child;
        }
        return map;
    }

    updateDOMProperties(oldProps, newProps) {
        let propsName;
        for(propsName in oldProps) {
            // 老属性有，新属性没有
            if(!newProps.hasOwnProperty(propsName)) {
                // 删除属性
                $(`[data-reactid="${this._reacteid}"]`).removeAttr(propsName);
            }

            // 如果是事件需要取消绑定
            if(/^on[A-Z]/.test(propsName)) {
                // 处理事件
                $(document).undelegate(`.${this._reacteid}`);
            }
        }

        // 老有，新有 || 老没有 新有
        for(propsName in newProps) {
            if(propsName === 'children') {
                // 处理子元素
                // let children = newProps[propsName];
                
                // children.map((child, index) => {
                //     const childComponent = createComponent(child);
                //     this.update(childComponent);
                // });
                // 这里不需要处理，因为已经在上面处理了
                // $(`[data-reactid="${this._reacteid}"]`).html(newProps[propsName]);
                continue;
            } else if(/^on[A-Z]/.test(propsName)) {
                // 处理事件 新增
                const eventName = propsName.slice(2).toLowerCase();
                $(document).delegate(`[data-reactid="${this._reacteid}"]`, `${eventName}.${this._reacteid}`, newProps[propsName]);
            } else if(propsName === 'style') {
                // 处理样式 新增&覆盖
                let styleObj = newProps[propsName];
                Object.entries(styleObj).map(([attr, value]) => {
                    $(`[data-reactid="${this._reacteid}"]`).css(attr, value);
                }).join(';');
            } else if(propsName === 'className') {
                // 处理 className 新增 && 覆盖
                $(`[data-reactid="${this._reacteid}"]`)[0].className(newProps[propsName]);
            } else {
                // 处理其他属性 新增&&覆盖
                $(`[data-reactid="${this._reacteid}"]`).prop(propsName, newProps[propsName]);
            }
        }
    }

    getHtmlString(reactid) {
        this._reacteid = reactid;

        const { type, props } = this._currentElement;
        // let tagStart = `<${type}`;
        let tagStart = `<${type} data-reactid=${this._reacteid}`;
        const tagEnd = `</${type}>`;
        let childString = '';
        this.props = props;

        this._renderedChildrenComponent = []; // 渲染的子组件
        for(let propName in props) {
            if(/^on[A-Z]/.test(propName)) {
                // 处理事件
                const eventName = propName.slice(2).toLowerCase();
                // 事件命名空间 `${eventName}.${this._reacteid}
                $(document).delegate(`[data-reactid="${this._reacteid}"]`, `${eventName}.${this._reacteid}`, props[propName]);
            } else if (propName === 'style') {
                // 处理样式
                let styleObj = props[propName];
                const styles = Object.entries(styleObj).map(([attr, value]) => {
                    return `${attr.replace(/([A-Z])/g, (match) => `-${match.toLowerCase()}`)}:${value}`;
                }).join(';');
                tagStart += ` style=${styles}`;
            } else if(propName === 'className') {
                // 处理 className
                tagStart += ` class="${props[propName]}"`;
            }else if (propName === 'children') {
                // 第一次 children 一定是数组
                let children = props[propName];
                children.map((child, index) => {
                    const childComponent = createComponent(child);
                    childComponent._moutIndex = index; // 记录当前元素的索引
                    this._renderedChildrenComponent.push(childComponent);
                    const childrenMarkUp = childComponent.getHtmlString(`${this._reacteid}.${index}`);
                    childString += childrenMarkUp;
                });
            } else {
                // 处理其他属性
                tagStart += ` ${propName}=${props[propName]}`;
            }
        }
        return  tagStart + '>' + childString + tagEnd;
    }
}

class compositeComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    // updateState(nextProps, nextState) {
    update(nextElement, partialState) {
        // console.log('compositeComponent update', nextElement, partialState);
        // 1. 更新状态 接收两个参数 新元素、新状态
        // 先获取到新元素
        this._currentElement = nextElement || this._currentElement;
        // 2. 获取新状态，不管要不要更新组件， 组件状态一定更改
        let nextState = this._componentInstance.state = Object.assign({}, this._componentInstance.state, partialState);
        // 3. 更新状态获取新属性对象
        let nextProps = this._currentElement.props;

        if (this._componentInstance.componentShouldUpdate && !this._componentInstance.componentShouldUpdate(nextProps, nextState)) {
            return;
        }

        // 4. 比较 更新属性 DOM diff
        let preRenderedComponentInstance = this._renderedComponentInstance;
        // 得到 上次渲染的元素
        let preRenderedElement = preRenderedComponentInstance._currentElement;
        let nextRenderedElement = this._componentInstance.render();

        // 元素类型一样，则深度比较，否则直接 replace
        if(shouldDeepCompare(preRenderedElement, nextRenderedElement)) {
            // 5.如果可以深比较， 把更新工作交给上次渲染出的 element 元素对应的 component 来处理
            preRenderedComponentInstance.update(nextRenderedElement);
            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate(nextProps, nextState);
        } else {
            this._renderedComponentInstance = createComponent(nextRenderedElement);
            let nextHtml = this._renderedComponentInstance.getHtmlString(this._reacteid);
            $(`[data-reactid="${this._reacteid}"]`).replaceWith(nextHtml);
        }

        // const renderedHtml = this.getHtmlString(this._reacteid);
        // $(document).trigger('mounted');
        // return renderedHtml;
    }

    /**
     * _componentInstance 当前组件实例
     * _renderedComponentInstance render方法返回的react元素对应的Component, 
     * _renderedComponentInstance._currentElement 对应的 render方法返回的react元素「在 UnitComponent 的 constructor中保存的」
     */
    getHtmlString(reactid) {
        this._reacteid = reactid;
        const { type: Component, props } = this._currentElement;
        const componentInstance = this._componentInstance = new Component(props);

        // 组件更新， 拿元素，做diff用
        componentInstance._currentComponent = this;

        // 如果组件将要渲染的函数让她执行
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 获取组件要渲染的元素
        const renderElement = componentInstance.render();

        // 通过element 得到对应的实例 用来返回最终的 html
        const renderedComponentInstance = this._renderedComponentInstance = createComponent(renderElement);

        // 得到对应的渲染html
        const renderedHtml = renderedComponentInstance.getHtmlString(this._reacteid);
        

        // 将要渲染的时候绑定事件
        $(document).on('mounted', (e) => {
            componentInstance.componentDidMount && componentInstance.componentDidMount();
        })

        return renderedHtml;
    }
}


function shouldDeepCompare (oldElement, newElement) {
    if(oldElement !== null && newElement !== null) {
        let oldType = typeof oldElement;
        let newType = typeof newElement;
        // 如果是字符串或者数字，直接渲染
        if((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
            // 如果是字符串或者数字，直接渲染
            return true;
        }
        // 如果是对象，判断类型
        if(oldElement instanceof Element && newElement instanceof Element) {
            return true;
        }
    }

    return false;
}


// React.createElement('button', 
//     {
//         id: 'sayhello', 
//         style: {
//             color: 'red', 
//             backgroundColor: 'blue'
//         },
//         onClick: sayhello
//     },
//     'hello',
//     React.createElement('span', null, 'hello'),
//     React.createElement('span', null, 'world')
// )

export {
    createComponent,
    createElement,
}