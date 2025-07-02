import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk, withExtraArgument } from 'redux-thunk';
import promise from 'redux-promise';
import logger from 'redux-logger';
import counter from './reducers/counter';
import user from './reducers/user';
import clientRequest from '@/client/request';
import serverRequest from '@/server/request';

// 可以将额外参数传递给异步 thunk 操作
const clientThunk = withExtraArgument(clientRequest);
const serverThunk = withExtraArgument(serverRequest);
const reducers = { counter, user }
const combinedReducer = combineReducers(reducers);

export function getClientStore() {
    console.log('============= getClientStore')
    const initialState = window.context.state;
    console.log('initialState', initialState)
    return applyMiddleware(clientThunk, promise, logger)(createStore)(combinedReducer, initialState);
}
export function getServerStore() {
    console.log('============= getServerStore')
    return applyMiddleware(serverThunk, promise, logger)(createStore)(combinedReducer);
}

// export function getStore() {
//     const reducers = { counter, user }
//     const combinedReducer = combineReducers(reducers);
//     const store = applyMiddleware(thunk, promise, logger)(createStore)(combinedReducer);
//     return store
// }