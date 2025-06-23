/** 这段代码实现了一个简化版的 Redux applyMiddleware，用于给 Redux 的 store.dispatch 增加中间件（如 logger）。
 * 
 * @param {*} logger 
 * @returns 
 */
// 这是一个高阶函数，接收一个中间件（如 logger）。
function applyMiddleware(logger){
    // 返回一个新的 createStore 让你用中间件增强原有的 createStore。
    return function(createStore){
        // 返回新的 store 创建函数
        return function(reducer, preloadedState){
            let dispatch;
            // 创建原始 store
            let store = createStore(reducer, preloadedState);
            // 用 logger 包装原始的 dispatch 这里 logger(store) 返回一个函数，接收原始 dispatch，返回一个新的 dispatch（带日志功能）。
            dispatch = logger(store)(store.dispatch);
            // 返回增强后的 store 用新的 dispatch 替换原有的 dispatch，其他属性不变
            return {
                ...store,
                dispatch
            };
        }
    }
}
export default applyMiddleware;