import { createStore, applyMiddleware } from 'redux';
import combinedReducer from './reducers';
import { routerMiddleware, createReduxHistory } from '../history';

// @reduxjs/toolkit 提供的 configureStore 来创建 store
// 让所有 dispatch 的 action 都会先经过 routerMiddleware 处理。
//routerMiddleware 可以拦截到 push('/counter') 这个action,调用history进行路径的跳转
//  action 会先经过 routerMiddleware。发现 action.type 是 @@router/CALL_HISTORY_METHOD，于是自动调用
// history 变化后，createReduxHistory 订阅了 history 的变化，会 dispatch 一个 LOCATION_CHANGE action 到 redux
// 这个 LOCATION_CHANGE action 会被 routerReducer 处理，把最新的路由信息同步到 redux 仓库的 router 分支。
// 组件可以通过 useSelector(state => state.router.location) 获取最新的路由状态，实现 redux 和路由的完全同步。
// 
export const store = applyMiddleware(routerMiddleware)(createStore)(combinedReducer);
// window.store.getState()
// reduxHistory 用于给 HistoryRouter 组件传递，实现 redux 和路由的状态同步。
export const reduxHistory = createReduxHistory(store);