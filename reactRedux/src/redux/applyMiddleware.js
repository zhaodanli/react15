import compose from './compose';

/** 这段代码实现了一个简化版的 Redux applyMiddleware，用于给 Redux 的 store.dispatch 增加中间件（如 logger）。
 * 
 * @param {*} logger 
 * @returns 
 */
// 这是一个高阶函数，接收一个中间件（如 logger）。
function applyMiddleware(...middlewares){
    // 返回一个新的 createStore 让你用中间件增强原有的 createStore。
    return function(createStore){
        // 返回新的 store 创建函数
        return function(reducer, preloadedState){
            // 创建原始 store
            let store = createStore(reducer,preloadedState);
            let dispatch;

            let middlewareAPI = {
                getState: store.getState,
                dispatch: (action) => dispatch(action)
            }

            let chain = middlewares.map(middleware => middleware(middlewareAPI));
            dispatch = compose(...chain)(store.dispatch);
            // // 用 logger 包装原始的 dispatch 这里 logger(store) 返回一个函数，接收原始 dispatch，返回一个新的 dispatch（带日志功能）。
            // dispatch = logger(store)(store.dispatch);
            // // 返回增强后的 store 用新的 dispatch 替换原有的 dispatch，其他属性不变
            return {
                ...store,
                dispatch
            };
        }
    }
}
export default applyMiddleware;

// preloadedState（有时也叫 initialState）是 Redux createStore 的第二个参数，用于为 store 提供初始状态。
// 为什么要加 preloadedState？
// 服务端渲染（SSR）/同构应用

// 服务端渲染时，服务端会把当前页面的状态序列化到 HTML 里，客户端启动时用 preloadedState 恢复，保证页面内容和状态一致。
// 持久化/本地存储

// 如果你用 localStorage、sessionStorage、IndexedDB 等保存了上次的 Redux 状态，页面刷新后可以用 preloadedState 恢复上次的状态。
// 测试/初始化特定状态

// 测试时可以用 preloadedState 传入不同的初始状态，方便模拟各种场景。
// 灵活性和可扩展性

// 允许你在创建 store 时动态指定初始状态，而不是只能用 reducer 里的默认值。