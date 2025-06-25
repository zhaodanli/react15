import { createAction } from './';

/** 函数用于简化 Redux 应用中处理异步操作（如 API 调用）的过程。它根据指定的类型前缀生成三种类型的动作：pending、fulfilled 和 rejected。这些动作可以在异步请求的生命周期中被派发。
 * 
 * @param {一个字符串，用于生成动作类型的前缀（例如，如果 typePrefix 是 "fetch/user"，那么生成的动作类型将是 "fetch/user/pending"、"fetch/user/fulfilled" 和 "fetch/user/rejected"）} typePrefix 
 * @param {一个执行异步操作的函数（例如，进行 fetch 请求）。此函数预期返回一个 Promise} payloadCreator 
 * @returns 
 */
function createAsyncThunk(typePrefix, payloadCreator) {
    let pending = createAction(typePrefix + "/pending", function () {
        return ({ payload: void 0 });
    });
    let fulfilled = createAction(typePrefix + "/fulfilled", function (payload) {
        return ({ payload });
    });
    let rejected = createAction(typePrefix + "/rejected", function (error) {
        return ({ error });
    });

    // 创建动作创建器
    function actionCreator(arg) {
        
        return function (dispatch) {
            // 派发 pending 动作以表示操作开始。
            dispatch(pending());

            // 使用给定参数调用 payloadCreator，以启动异步操作，返回一个 promise。
            const promise = payloadCreator(arg);

            // 创建一个 abortedPromise 来处理操作可能需要中止的情况。当调用 abort 函数时，此 promise 将被拒绝。
            let abort;
            const abortedPromise = new Promise((_, reject) => {
                abort = () => {
                    reject({ name: "AbortError", message: "Aborted" });
                }
            });

            // 使用 Promise.race 函数对原始 promise 和 abortedPromise 进行竞态处理。这意味着如果调用了 abort 函数，它会立即拒绝 promise。
            Promise.race([promise, abortedPromise]).then(result => {
                // 当原始 promise 成功解析时，会派发 fulfilled 动作并传入结果。
                return dispatch(fulfilled(result));
            }, (error) => {
                // 如果 promise 被拒绝（无论是因为出错还是因为被中止），则会派发 rejected 动作并传入错误。
                return dispatch(rejected(error));
            });

            return Object.assign(promise, { abort });
        }
    }

    // 该函数返回 actionCreator 函数本身，同时将 pending、fulfilled 和 rejected 动作创建器附加到同一对象中，以便于访问。
    return Object.assign(actionCreator, { pending, rejected, fulfilled });
}
export default createAsyncThunk;