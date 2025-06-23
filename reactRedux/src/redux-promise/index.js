// 让 Redux 支持异步 action，无需手写 thunk 或 saga。
function promise({ getState, dispatch }) {
    return function (next) {
        return function (action) {
            if (action.then && typeof action.then === 'function') {
                // 1. action 本身是 Promise dispatch(fetchData())
                action.then(dispatch).catch(dispatch);
            } else if (action.payload && typeof action.payload.then === 'function') {
                // 2. action.payload 是 Promise dispatch({ type: 'FETCH', payload: fetchData() })），
                action.payload
                    .then(result => dispatch({ ...action, payload: result }))
                    .catch(error => {
                        // 3. 普通 action，直接传递给下一个中间件或原始 dispatch
                        dispatch({ ...action, payload: error, error: true });
                        return Promise.reject(error);
                    })
            } else {
                next(action);
            }
        }
    }
}
export default promise;