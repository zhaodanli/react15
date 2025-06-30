const immutable = require("immutable");
const assert = require("assert");

// 基础对象
// let obj1 = immutable.Map({ name: 'zfpx', age: 8 });
// let obj2 = obj1.set('name', 'zfpx2');
// let obj3 = obj2.update('age', x => x + 1);
// let obj4 = obj3.merge({ home: '北京' });
// console.log(
//     obj1._root, 
//     obj2._root, 
//     obj3._root, 
//     obj4._root
// );


// map 相关
// let obj6 = immutable.fromJS({ user: { name: 'zfpx', age: 8 }, 'k': 'v' });
// let obj7 = obj6.setIn(['user', 'name'], 'zfpx2');
// let obj8 = obj7.updateIn(['user', 'age'], x => x + 1);
// let obj9 = obj8.mergeIn(["user"], { home: '北京' });
// console.log(
//     obj6._root.entries[0][1]._root, 
//     obj7._root.entries[0][1]._root, 
//     obj8._root.entries[0][1]._root, 
//     obj9._root.entries[0][1]._root, 
// );

// console.log(obj6.get('user'));
// console.log(obj6.getIn(['user', 'name']));
// console.log(...obj6.keys());
// console.log(...obj6.values());
// console.log(...obj6.entries());

// 这两行代码使用了 immutable.js 库来创建两个不可变的 Map 结构 map1 和 map2，这两个 Map 存储了相同的键值对：name 和 age。
var map1 = immutable.Map({ name: 'zfpx', age: 9 });
var map2 = immutable.Map({ name: 'zfpx', age: 9 });
// 这行代码使用 assert 来检查 map1 和 map2 是否不是同一个对象引用。因为它们是两个不同的 Map 实例，即使内容相同，比较结果为 true。
console.log(assert(map1 !== map2));
// Object.is() 是一个 ES6 的方法，可以检测两个值是否为同一值。由于 map1 和 map2 是不同的实例，Object.is(map1, map2) 返回 false。
console.log(assert(Object.is(map1, map2) === false));
// immutable.is() 是 immutable.js 中的一个方法，用于检查两个不可变数据结构是否相等。这个比较不仅关注对象的引用，还考虑对象的内容，即使它们是不同的对象，内容相同的情况下
console.log(assert(immutable.is(map1, map2) === true)); 

// list 相关
// let arr1 = immutable.fromJS([1, 2, 3]);
// console.log(arr1.size);
// let arr2 = arr1.push(4);
// console.log(arr2);
// let arr3 = arr2.pop();
// console.log(arr3);
// let arr4 = arr3.update(2, x => x + 1);
// console.log(arr4);
// let arr5 = arr4.concat([5, 6]);
// console.log(arr5);
// let arr6 = arr5.map(item => item * 2);
// console.log(arr6);
// let arr7 = arr6.filter(item => item >= 10);
// console.log(arr7);
// console.log(arr7.get(0));
// console.log(arr7.includes(10));
// console.log(arr7.last());
// let val = arr7.reduce((val, item) => val + item, 0);
// console.log(val);
// console.log(arr7.count());

// // 性能优化相关
// import _ from 'lodash';
// import { is, Map } from 'immutable';

// class Counter extends Component {
//     // immutable
//     state = {
//         counter: Map({ number: 0 })
//     }
//     // state = {counter:{number:0}}
//     handleClick = () => {
//         let amount = this.amount.value ? Number(this.amount.value) : 0;
//         // 深度克隆+浅比较
//         // let state = _.cloneDeep(this.state);
//         // state.counter.number = this.state.counter.number + amount;
//         // this.setState(state);

//         // immutable
//         let counter = this.state.counter.update('number', val => val + amount);
//         this.setState({counter});
//     }
//     shouldComponentUpdate(nextProps, nextState) {
//         // 深比较 浪费性能
//         return !_.isEqual(prevState, this.state);
//     }
//     render() {
//         console.log('render');
//         return (
//             <div>
//                 <p>{this.state.number}</p>
//                 <input ref={input => this.amount = input} />
//                 <button onClick={this.handleClick}>+</button>
//             </div>
//         )
//     }
// }

// ReactDOM.render(
//     <Counter />,
//     document.getElementById('root')
// )

// // redux+immutable
// import PropTypes from 'prop-types'
// import { createStore, combineReducers, applyMiddleware } from 'redux'
// import { Provider, connect } from 'react-redux'
// import immutable, { is, Map } from 'immutable';
// import PureComponent from './PureComponent';

// const ADD = 'ADD';

// const initState = Map({ number: 0 });

// function reducer(state = initState, action) {
//     switch (action.type) {
//         case ADD:
//             return state.update('number', (value) => value + action.payload);
//         default:
//             return state
//     }
// }

// // redux-immutable中间件
// // combineReducers 实现
// function combineReducers(reducers) {
//     return function (state = Map(), action) {
//         let newState = Map();
//         for (let key in reducers) {
//             newState = newState.set(key, reducers[key](state.get(key), action));
//         }
//         return newState;
//     }
// }

// reducers = combineReducers({
//     reducer
// });

// const store = createStore(reducer);

// class Caculator extends PureComponent {
//     render() {
//         return (
//             <div>
//                 <p>{this.props.number}</p>
//                 <input ref={input => this.amount = input} />
//                 <button onClick={() => this.props.add(this.amount.value ? Number(this.amount.value) : 0)}>+</button>
//             </div>
//         )
//     }
// }
// let actions = {
//     add(payload) {
//         return { type: ADD, payload }
//     }
// }
// const ConnectedCaculator = connect(
//     state => ({ number: state.get('number') }),
//     actions
// )(Caculator)

// ReactDOM.render(
//     <Provider store={store}><ConnectedCaculator /></Provider>,
//     document.getElementById('root')
// )

// // react-router-redux使用

// import { createStore, applyMiddleware } from "redux";
// import { Provider } from "react-redux";

// import createHistory from "history/createBrowserHistory";
// import { Route } from "react-router";

// import { combineReducers } from 'redux-immutable';
// import { Map } from 'immutable';

// import {
//     ConnectedRouter,
//     routerMiddleware,
//     push,
//     LOCATION_CHANGE
// } from "react-router-redux";

// const initialRouterState = Map({
//     location: null,
//     action: null
// });

// export function routerReducer(state = initialRouterState, { type, payload = {} } = {}) {
//     if (type === LOCATION_CHANGE) {
//         const location = payload.location || payload;
//         const action = payload.action;

//         return state
//             .set('location', location)
//             .set('action', action);
//     }

//     return state;
// }
// const history = createHistory();

// const middleware = routerMiddleware(history);

// const store = createStore(
//     combineReducers({
//         router: routerReducer
//     }),
//     applyMiddleware(middleware)
// );

// window.push = push;
// window.store = store;

// let Home = () => <div>Home</div>
// let About = () => <div>About</div>
// let Topics = () => <div>Topics</div>
// ReactDOM.render(
//     <Provider store={store}>
//         <ConnectedRouter history={history}>
//             <div>
//                 <Route exact path="/" component={Home} />
//                 <Route path="/about" component={About} />
//                 <Route path="/topics" component={Topics} />
//             </div>
//         </ConnectedRouter>
//     </Provider>,
//     document.getElementById("root")
// );