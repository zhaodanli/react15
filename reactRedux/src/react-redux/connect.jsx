import React, { useContext, useMemo, useReducer, useLayoutEffect } from 'react';
import ReactReduxContext from './ReactReduxContext';
import { bindActionCreators } from '../redux';


// import { bindActionCreators } from '../redux';
// import actions from '../store/actions/counter1'
// import store from '../store';
// const boundActions = bindActionCreators(actions, store.dispatch);
/**
 * PureComponent当属性和状态没有变化的时候不重新渲染
 * 刚才做的优化是有些值只计算一次，不需要反复计算
 * 因为函数组件没有构造函数，没有地方说只能执行一次，只能用useMemo
 * @param {*} mapStateToProps 把仓库中状态映射为当前的组件的属性
 * @param {*} mapDispatchToProps 把派发动作的方法映射为组件的属性
 * 高阶组件模式（HOC）
connect 本质上是一个高阶组件：它接收一个组件，返回一个新的组件，这个新组件会自动订阅 Redux store，并把 state 和 dispatch 通过 props 传递给原组件。
这样实现了“逻辑复用”和“依赖注入”。
观察者模式

被 connect 包裹的组件会订阅（subscribe）Redux store，当 store 发生变化时，组件会自动收到通知并更新。
这就是典型的观察者模式：组件是观察者，store 是被观察者。
 */
function connect(mapStateToProps, mapDispatchToProps) {
    return function (OldComponent) {
        return class extends React.Component {

            // 这行代码的意思是：让当前组件可以通过 this.context 直接访问到 ReactReduxContext 提供的值。
            // 这是 React 官方支持的 class 组件 context API 用法。
            static contextType = ReactReduxContext;

            // 当你在 class 组件里设置了 static contextType，React 会在调用构造函数时，把 context 作为第二个参数传进来。
            constructor(props, context) {
                super(props);
                const { store } = context;
                const { getState, subscribe, dispatch } = store;

                this.state = mapStateToProps(getState());

                this.unsubscribe = subscribe(() => {
                    this.setState(mapStateToProps(getState()));
                });

                let dispatchProps;
                if (typeof mapDispatchToProps === 'function') {
                    dispatchProps = mapDispatchToProps(dispatch);
                } else if (typeof mapDispatchToProps === 'object') {
                    dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
                } else {
                    dispatchProps = { dispatch };
                }
                this.dispatchProps = dispatchProps;
            }

            componentWillUnmount() {
                this.unsubscribe();
            }
            
            render() {
                return <OldComponent {...this.props} {...this.state} {...this.dispatchProps} />
            }
        }
    }
}


export default connect;

// function connect(mapStateToProps, mapDispatchToProps) {
//     return function (OldComponent) {
//         return function (props) {
//             const { store } = useContext(ReactReduxContext);
//             const { getState, dispatch, subscribe } = store;
//             const prevState = getState();
//             const stateProps = useMemo(() => mapStateToProps(prevState), [prevState]);
//             let dispatchProps = useMemo(() => {
//                 console.log('dispatchProps render');
//                 let dispatchProps;
//                 if (typeof mapDispatchToProps === 'function') {
//                     dispatchProps = mapDispatchToProps(dispatch);
//                 } else if (typeof mapDispatchToProps === 'object') {
//                     dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
//                 } else {
//                     dispatchProps = { dispatch };
//                 }
//                 return dispatchProps;
//             }, [dispatch]);
//             const [, forceUpdate] = useReducer(x => x + 1, 0);
//             useLayoutEffect(() => {
//                 return subscribe(forceUpdate);
//             }, [subscribe]);
//             return <OldComponent {...props} {...stateProps} {...dispatchProps} />
//         }
//     }
// }