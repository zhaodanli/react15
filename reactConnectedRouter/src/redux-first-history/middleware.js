import { CALL_HISTORY_METHOD } from './actions'

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