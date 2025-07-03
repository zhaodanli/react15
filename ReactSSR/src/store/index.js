import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk, withExtraArgument } from 'redux-thunk';
import promise from 'redux-promise';
import logger from 'redux-logger';
import counter from './reducers/counter';
import user from './reducers/user';
import clientRequest from '@/client/request';
import serverRequest from '@/server/request';
import auth from './reducers/auth';

import { createBrowserHistory, createMemoryHistory } from 'history';
import { createReduxHistoryContext } from "redux-first-history";

// 客户端服务端不一致
// import { routerReducer, routerMiddleware, createReduxHistory } from '@/history'

// 可以将额外参数传递给异步 thunk 操作
const clientThunk = withExtraArgument(clientRequest);

export function getClientStore() {
    const { routerReducer, routerMiddleware, createReduxHistory } = createReduxHistoryContext({ history: createBrowserHistory() });
    // 合并 reducer
    const reducers = { counter, user, auth, router: routerReducer };
    const combinedReducer = combineReducers(reducers);

    const initialState = window.context.state;
    // return applyMiddleware(clientThunk, promise, logger)(createStore)(combinedReducer, initialState);
    const store = applyMiddleware(clientThunk, promise, routerMiddleware, logger)
        (createStore)
        (combinedReducer, initialState);
    // 获取redux版本的 histroy
    const history = createReduxHistory(store);
    return { store, history }
}
export function getServerStore(req) {
    const { routerReducer, routerMiddleware, createReduxHistory } = createReduxHistoryContext({ history: createMemoryHistory() });

    // 合并 reducer
    const reducers = { counter, user, auth, router: routerReducer };
    const combinedReducer = combineReducers(reducers);

    // return applyMiddleware(serverThunk, promise, logger)(createStore)(combinedReducer);
    const store = applyMiddleware( withExtraArgument(serverRequest(req)), promise, routerMiddleware, logger)
        (createStore)
        (combinedReducer);
    const history = createReduxHistory(store);
    return { store, history }
}

// export function getStore() {
//     const reducers = { counter, user }
//     const combinedReducer = combineReducers(reducers);
//     const store = applyMiddleware(thunk, promise, logger)(createStore)(combinedReducer);
//     return store
// }