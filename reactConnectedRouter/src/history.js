import { createBrowserHistory } from 'history';
import { createReduxHistoryContext } from "./redux-first-history";

// 将原生 history 对象与 redux-first-history 的上下文整合，统一导出给整个项目使用。
// 创建原生 history 实例
const history = createBrowserHistory();
// 调用 createReduxHistoryContext({ history })，生成：
// routerReducer：用于同步路由状态到 redux。
// routerMiddleware：用于拦截路由相关 action 并操作 history。
// createReduxHistory：用于生成可传给 HistoryRouter 的 reduxHistory 实例。
const { routerReducer, routerMiddleware, createReduxHistory } = createReduxHistoryContext({ history });

// 统一导出这三个对象，供 store 配置和路由容器使用。
export {
    routerReducer,
    routerMiddleware,
    createReduxHistory
}