import { createStore } from '../redux';
import reducer from './reducers';

const store = createStore(reducer, { counter1: { number: 0 }, counter2: { number: 0 } });

// 中间件要实现的部分 打印日志
let dispatch = store.dispatch;
store.dispatch = function (action) {
    console.log(store.getState());
    dispatch(action);
    console.log(store.getState());
    return action;
};

// 实现异步
store.dispatch = function (action) {
    setTimeout(() => {
        dispatch(action);
    }, 1000);
    return action;
};


export default store;