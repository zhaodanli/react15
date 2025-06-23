import { CALL_HISTORY_METHOD } from './actions'


/** createRouterMiddleware(history)：生成一个 redux 中间件。
拦截所有 action，遇到 type 为 CALL_HISTORY_METHOD 时，自动调用 history 的对应方法（如 push、replace），实现“通过 dispatch 控制路由跳转”。
 * 
 * @param {*} history 
 * @returns 
 */
export function createRouterMiddleware(history) {
    return function () {
        return function (next) {
            return function (action) {
                if (action.type !== CALL_HISTORY_METHOD) {
                    return next(action);
                }
                const { method, args } = action.payload;
                history[method](...args);
            }
        }
    }
}