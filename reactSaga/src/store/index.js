import { createStore, applyMiddleware } from 'redux';
import reducer from './reducer';

// 配置中间件1 createSagaMiddleware -> run -> runSaga
import createSagaMiddleware from './redux-saga';
import rootSaga from './sagas';

// let store = applyMiddleware()(createStore)(reducer);
let sagaMiddleware = createSagaMiddleware();
let store = applyMiddleware(sagaMiddleware)(createStore)(reducer);
sagaMiddleware.run(rootSaga);
window.store = store;
export default store;
