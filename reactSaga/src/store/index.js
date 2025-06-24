import { createStore, applyMiddleware } from 'redux';
import reducer from './reducer';

// 配置中间件1 createSagaMiddleware -> run -> runSaga
import createSagaMiddleware from './redux-saga';
import rootSaga from './sagas';

// let store = applyMiddleware()(createStore)(reducer);
let sagaMiddleware = createSagaMiddleware();

// 启动时 Redux 会自动执行：reducer(undefined, { type: '@@redux/INITxxxx' }); 
// 1. 启动时 reducer 收到 redux 初始化 action。 reducer收到action {type: '@@redux/INITz.x.d.k.5'}
// 2. 组件点击按钮，dispatch 了 ASYNC_ADD。这个 action 先经过 saga 中间件，next(action) 传递到 reducer。
// reducer 收到 ASYNC_ADD，打印日志：reducer收到action {type: 'ASYNC_ADD'}。
// saga 中间件 emit
// saga 中间件执行 channel.emit('ASYNC_ADD', action)，通知所有监听 ASYNC_ADD 的 saga。
// 你的 saga 里有 yield take('ASYNC_ADD') 或 takeEvery('ASYNC_ADD', workerSaga)，runSaga 注册了监听。
// 监听器被唤醒，runSaga 的 next 被调用，saga 生成器继续往下走。
// workerSaga 执行
// 被唤醒的 saga 继续执行，通常会 yield put({ type: 'ADD' })。
// 这会 dispatch 一个 ADD action。
// ADD action 经过 saga 中间件，next(action) 传递到 reducer。
// reducer 收到 ADD，打印日志：reducer收到action {type: 'ADD'}。
// saga 中间件也 emit 了 ADD，打印：emit ADD {type: 'ADD'}。
let store = applyMiddleware(sagaMiddleware)(createStore)(reducer);
// run saga 执行 rootSaga, 所有在 rootSaga 里 yield 的 take、takeEvery、fork、call 等副作用监听和流程控制才会生效。
// 让 sagaMiddleware 启动 rootSaga，注册所有副作用监听（如 takeEvery、take）。
// 之后 dispatch 的 action 才能被 saga 监听、拦截和处理。
sagaMiddleware.run(rootSaga);
window.store = store;
export default store;
