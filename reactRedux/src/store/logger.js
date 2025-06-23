/** 这段代码实现了一个Redux 日志中间件 logger，
 * 用于在每次 dispatch action 时打印 action 前后的 state，帮助调试 Redux 状态变化。


 * 
 * @param {*} param0 
 * @returns 
 */
// 这是中间件的第一层，接收 store 的方法（getState, dispatch）
export default function logger({ getState, dispatch }) {
    // 第二层，接收下一个中间件的 dispatch（或原始 store.dispatch）
    return function (next) {
        // 第三层，返回一个新的 dispatch 方法，拦截所有 action。
        return function (action) {
            console.log('prev state', getState());
            // 把 action 传递给下一个中间件或原始 dispatch，真正触发 reducer 更新 state。
            next(action);
            console.log('next state', getState());
            return action;
        }
    }
}