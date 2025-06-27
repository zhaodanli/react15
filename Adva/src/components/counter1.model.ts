const delay = (millseconds: number) => {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(null);
        }, millseconds);
    });
}

export default ({
    // namespace model 的命名空间，同时也是他在全局 state 上的属性，只能用字符串
    namespace: 'counter1',

    // state 初始值
    state: { number: 0 },

    // reducers 以 key/value 格式定义 reducer。用于处理同步操作，唯一可以修改 state 的地方。由 action 触发。
    reducers: { // 接收老状态，返回新状态
        add(state: any) { //dispatch({type:'add'});
            return { number: state.number + 1 };
        },
        minus(state: any) {//dispatch({type:'minus'})
            return { number: state.number - 1 };
        }
    },

    // effects 以 key/value 格式定义 effect。用于处理异步操作和业务逻辑，不直接修改 state。由 action 触发，可以触发 action，可以和服务器交互，可以获取全局 state 的数据等等。
    // 延时操作 调用接口  等待
    effects: {
        *asyncAdd(action, { put, call }) { //redux-saga/effects {put,call}
            yield call(delay, 1000);//把100传给delay并调用，yield会等待promise完成
            yield put({ type: 'add' });
        },
    },

    // subscriptions 以 key/value 格式定义 subscription。subscription 是订阅，用于订阅一个数据源，然后根据需要 dispatch 相应的 action。在 app.start() 时被执行，数据源可以是当前的时间、服务器的 websocket 连接、keyboard 输入、geolocation 变化、history 路由变化等等。
    subscriptions: {
        keyboard({ dispatch }) {
            keymaster('space', () => {
                dispatch({ type: 'add' });
            });
        },
        changeTitle({ history }) {
            setTimeout(function () {
                history.listen(({ pathname }) => {
                    document.title = pathname;
                });
            }, 1000);

        },
    }
});