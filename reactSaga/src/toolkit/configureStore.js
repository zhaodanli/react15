import { combineReducers, applyMiddleware, createStore, compose } from 'redux';
import { thunk } from 'redux-thunk';
import logger from 'redux-logger';

function isPlainObject(value) {
    if (typeof value !== "object" || value === null)
        return false;
    return Object.getPrototypeOf(value) === Object.prototype;
}


function configureStore(options = {}) {
    let {
        reducer,
        middleware = [thunk, logger],
        preloadedState,
        devTools = true,
        enhancers = undefined,
    } = options;

    let rootReducer;
    if (typeof reducer === "function") {
        rootReducer = reducer;
    } else if (isPlainObject(reducer)) {
        // 如果是随想需要合并
        rootReducer = combineReducers(reducer);
    }

    middleware = typeof middleware === 'function' ? middleware(() => [thunk]) : middleware
    const enhancer = applyMiddleware(...middleware);
    // 扩展工具
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    // const store = createStore(
    //     rootReducer,         // 第一个参数：reducer
    //     preloadedState,      // 第二个参数：初始 state（可选）
    //     enhancer             // 第三个参数：增强器（可选） 要求是一个函数，类型为：(storeCreator: Function) => Function
    // );
    const store = createStore(rootReducer, preloadedState, composeEnhancers(enhancer));
    // const store = createStore(rootReducer, preloadedState);
    return store;
}

export default configureStore;