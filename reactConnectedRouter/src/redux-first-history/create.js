import { createRouterMiddleware } from './middleware';
import { push, locationChangeAction } from './actions';
import { createRouterReducer } from './reducer';

/** 提供 createReduxHistoryContext，用于集成 history 和 redux。
    * 返回 routerMiddleware（用于拦截 CALL_HISTORY_METHOD）
        * routerReducer（用于同步 location 到 redux）、
        * createReduxHistory（生成可用于 HistoryRouter 的 history 对象）。
    * createReduxHistory(store)：订阅 history 变化，每次变化都 dispatch LOCATION_CHANGE 到 redux，并暴露兼容 history 的 API（如 push、location、action）。
 */
/**
 * 创建redux版本的history 上下文
 * @param {*} history 原始的history对象  
 */
export function createReduxHistoryContext({ history }) {
    // 用于拦截 CALL_HISTORY_METHOD routerMiddleware 生成中间件 routerMiddleware 就是个中间件
    const routerMiddleware = createRouterMiddleware(history);
    // 用于同步路由状态到 redux createRouterReducer 生成reducer routerReducer 就是个 reducer。
    const routerReducer = createRouterReducer(history);

    // 用于生成可传给 HistoryRouter 的 reduxHistory 实例
    function createReduxHistory(store) {
        // 默认触发 一次变更
        store.dispatch(locationChangeAction(history.location, history.action));
        //订阅路径变化事件，当路径发生变化后重新添发动作给仓库，重新保存路径
        history.listen(({ location, action }) => {
            store.dispatch(locationChangeAction(location, action));
        });
        return {
            createHref: history.createHref,
            push: (...args) => store.dispatch(push(...args)),//history.push('/counter');
            listen: history.listen,
            get location() {//原来获取路径是从history对象上取的，现在是从仓库中取
                return store.getState().router.location;
            },
            get action() {
                return store.getState().router.action;
            }
        };
    }

    return {
        routerMiddleware, 
        createReduxHistory,
        routerReducer
    }
}