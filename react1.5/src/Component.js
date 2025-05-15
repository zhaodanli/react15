import { findDOM, compareTwoVdom } from './react-dom';

export const updateQueue = {
    isBatchingUpdate: false, // 当前是否处于批量更新模式
    updaters: new Set(), // 存储所有的 updater 实例，对应抑遏组件
    batchUpdater() {
        // 批量更新
        updateQueue.isBatchingUpdate = false;
        for (let updater of updateQueue.updaters) {
            updater.updateComponent();
        }
        updateQueue.updaters.clear();
    }
}

class Updater {
    constructor(classInstance) {
        this.classInstance = classInstance;
        this.pendingStates = [];
        this.callbacks = [];
    }
    
    addState(newState, callback) {
        this.pendingStates.push(newState);
        if (typeof callback === 'function') {
            // 如果有回调函数，添加到回调函数数组中
            this.callbacks.push(callback);
        }
        this.emitUpdate();
    }

    emitUpdate(nextProps) {
        this.nextProps = nextProps;
        // updateQueue.updaters.add(this);
        // queueMicrotask(updateQueue.batchUpdater)
        if(updateQueue.isBatchingUpdate) {
            // 如果处于批量更新模式，直接添加到 updater 中
            updateQueue.updaters.add(this);
        } else {
            // 如果不处于批量更新模式，直接更新
            this.updateComponent();
        } 
    }

    updateComponent() {
        const { classInstance, pendingStates, callbacks, nextProps } = this;
        // 1. 获取当前的状态
        if (nextProps || pendingStates.length > 0) {
            this.shouldUpdate(classInstance, nextProps, this.getState());
        }

        queueMicrotask(() => {
            // 6. 执行回调函数
            callbacks.forEach((callback) => {
                callback.call(this);
            });
            callbacks.length = 0;
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
    shouldUpdate(classInstance, nextProps={}, newState) {
        let willUpdate = true;
        // 还没实现属性更新，先用老属性
        // const nextProps = classInstance.props;

        if(classInstance.shouldComponentUpdate && !classInstance.shouldComponentUpdate(nextProps, newState)) {
            // 1. 如果有 shouldComponentUpdate 方法，调用它 如果结果为false 则不需要更新
            willUpdate = false;
        }

        if(willUpdate && classInstance.componentWillUpdate){
            classInstance.componentWillUpdate();
        }

        if(nextProps){
            classInstance.props = nextProps;
        }

        // 不管要不要更新， 组件状态肯定会改
        classInstance.state = newState;

        // 3. 更新状态
        classInstance.state = newState;
        if(willUpdate) {
            classInstance.forceUpdate();
        }
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
        console.log('forceUpdate');
        let oldRenderVdom = this.oldRenderVdom;
        let oldDOM = findDOM(oldRenderVdom);
        if(this.constructor.getDerivedStateFromProps) {
            let newState = this.constructor.getDerivedStateFromProps(this.props, this.state);
            if(newState) {
                this.state = {...this.state, ...newState}
            }
        }
        let newRenderVdom = this.render();
        compareTwoVdom(oldDOM.parentNode, oldRenderVdom, newRenderVdom);
        this.oldRenderVdom = newRenderVdom;
        if(this.componentDidUpdate){
            this.componentDidUpdate(this.props,this.state);
        }
    }
}