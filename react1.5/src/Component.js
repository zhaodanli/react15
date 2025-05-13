import { findDOM, compareTwoVdom } from './react-dom';

class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;
        this.pendingStates = [];
        this.callBacks = [];
    }
    
    addState(newState, callback) {
        this.pendingStates.push(newState);
        if (typeof callback === 'function') {
            // 如果有回调函数，添加到回调函数数组中
            this.callBacks.push(callback);
        }
        this.emitUpdate();
    }

    emitUpdate() {
       this. updateComponent();
    }

    updateComponent() {
        const { classInstance, pendingStates } = this;
        // 1. 获取当前的状态
        if (pendingStates.length > 0) {
            this.shouldUpdate(classInstance, this.getState());
        }
        // 6. 执行回调函数
        this.callBacks.forEach((callback) => {
            callback();
        });
    }

    getState() {
        // 1. 获取当前的状态
       const { classInstance, pendingStates } = this;
        // 2. 合并状态
        let state = classInstance.state;
        this.pendingStates.forEach((nextState) => {
            if (typeof nextState === 'function') {
                nextState = nextState(state);
            }
            // 合并状态
            state = { ...state, ...nextState };
        });
        this.pendingStates.length = 0;
        return state;
    }

    // 7. 判断是否需要更新
    shouldUpdate(classInstance, newState) {
        // 3. 更新状态
        classInstance.state = newState;
        classInstance.forceUpdate();
    }
}

export class Component {
    static isReactComponent=true
    constructor(props) {
        this.props = props;
        this.state = {};
        this.updater = new Updater(this);
    }
    
    setState(partialState, callback) {
        this.updater.addState(partialState, callback);
    }

    forceUpdate() {
        let oldRenderVdom = this.oldRenderVdom;
        let oldDOM = findDOM(oldRenderVdom);
        let newRenderVdom = this.render();
        compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
        this.oldRenderVdom = newRenderVdom;
    }
}