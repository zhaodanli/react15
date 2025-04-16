import $ from 'jquery';
import Component from './Component.jsx';

const React = {
    render,
    rootIndex: 0
}
function render(element, container) {
    console.log('render');

    // 渲染成 HTML 字符串
    const component = createComponent(element);
    // 返回 html 标记
    let markUp = component.getHtmlString(React.rootIndex);
    $(container).html(markUp);
    $(document).trigger('mounted');
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

class textComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    getHtmlString(reactid) {
        this._reacteid = reactid;
        return  `<span data-reactid=${reactid}>${this._currentElement}</span>`;
    }
}

class NativeComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    getHtmlString(reactid) {
        this._reacteid = reactid;

        const { type, props } = this._currentElement;
        // let tagStart = `<${type}`;
        let tagStart = `<${type} data-reactid=${this._reacteid}`;
        const tagEnd = `</${type}>`;
        let childrenString = '';
        this.props = props;
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
                    const childrenComponent = createComponent(child);
                    const childrenMarkUp = childrenComponent.getHtmlString(`${this._reacteid}.${index}`);
                    childrenString += childrenMarkUp;
                });
            } else {
                // 处理其他属性
                tagStart += ` ${propName}=${props[propName]}`;
            }
        }
        return  tagStart + '>' + childrenString + tagEnd;
    }
}

class compositeComponent extends UnitComponent {
    constructor(element) {
        super(element);
    }

    /**
     * _componentInstance 当前组件实例
     * _renderedComponentInstance render方法返回的react元素对应的Coponent, 
     * _renderedComponentInstance._currentElement 对应的 render方法返回的react元素「在 UnitComponent 的 constructor中保存的」
     */
    getHtmlString(reactid) {
        this._reacteid = reactid;
        const { type: Component, props } = this._currentElement;
        const componentInstance = this._componentInstance = new Component(props);

        this._componentInstance.setState = (newState) => {
            // // 1. 更新状态 接收两个参数 新元素、新状态
            // this._currentElement.updateState(null, newState);
            // // 2. 重新渲染
            // const renderedHtml = this.getHtmlString(this._reacteid);
            // $(document).trigger('mounted');
            // return renderedHtml;
            console.log(111)
        }

        // 组件更新， 拿元素，做diff用
        this._componentInstance.currentComponent = this;

        // 如果组件将要渲染的函数让她执行
        componentInstance.componentWillMount && componentInstance.componentWillMount()
        // 获取组件要渲染的元素
        const renderElement = componentInstance.render();

        // 得到对应的实例
        const renderedComponentInstance = this._renderedComponentInstance = createComponent(renderElement);

        // 得到对应的渲染html
        const renderedHtml = renderedComponentInstance.getHtmlString(this._reacteid);
        

        // 将要渲染的时候绑定事件
        $(document).on('mounted', (e) => {
            componentInstance.componentDidMount && componentInstance.componentDidMount();
        })

        return renderedHtml;
        
        // 处理组件的生命周期
        // if (componentInstance.componentWillMount) {
        //     componentInstance.componentWillMount();
        // }
        // 处理组件的属性
        // if (componentInstance.componentWillReceiveProps) {
        //     componentInstance.componentWillReceiveProps(props);
        // }
        // 处理组件的状态
        // if (componentInstance.componentWillUpdate) {
        //     componentInstance.componentWillUpdate(props);
        // }
        // const renderElement = componentInstance.render();
        // const renderedComponentInstance = this._renderedComponentInstance = createComponent(renderElement);
        // const renderedHtml = renderedComponentInstance.getHtmlString(this._reacteid);

        // if (componentInstance.componentWillUnmount) {
        //     componentInstance.componentWillUnmount();
        // }
        // return renderedHtml;
    }
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

export default { 
    render,
    createElement,
    Component,
};