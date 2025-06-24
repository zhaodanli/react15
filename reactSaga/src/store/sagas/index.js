// 获取方法2
import { put, take, fork, takeEvery, call, cps, all, delay, cancel } from '../redux-saga/effects';
import * as types from '../action-types';

function delayPromise(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function delayCalBack(ms, callback) {
    setTimeout(() => callback(null, 'ok'), ms);
}

// 工作
/** call 用于处理返回 Promise 的异步函数（或同步函数）。
 * 你可以 yield call(fn, ...args)，saga 会自动执行 fn(...args)，如果返回 Promise 会等待其 resolve。
 * 适合现代 async/await、Promise 风格的异步代码。
 *  cps 用于处理Node.js 风格的回调异步函数，即最后一个参数是 callback(err, result)。
 *  yield cps(fn, ...args)，saga 会自动把 next 作为 callback 传给 fn。
 * 适合老式 Node.js API 或 callback 风格的异步代码。 代前端开发推荐优先用 call，只有遇到 callback 风格的库才用 cps。
**/
function* workerSaga() {
    // ========== case1 ================
    // yield delayPromise(2000); // 2000 模拟fork使用场景
    // yield put({ type: types.ADD });

    // ========== case2 call ================
    // yield call(delayPromise, 2000);
    // yield put({ type: types.ADD });

    // ========== case3 cps ================
    yield cps(delayCalBack, 2000);
    console.log('cps =========');
    yield put({ type: types.ADD });
}

// 监听
function* watcherSaga() {
    // ========== case1 ================
    // yield take(types.ASYNC_ADD);
    // console.log('ASYNC_ADD 被唤醒');
    // yield workerSaga();

    // ========== case2 解决 take职能监听一次的问题 但是会阻塞后面的操作 ================
    // while(true) {
    //     // take 可以产出 effect 等一个动作，等到了就会向下执行
    //     yield take(types.ASYNC_ADD);
    //     yield workerSaga();
    // }

    // ========== case3 解决 让 saga 支持“并发”，主流程和子流程互不阻塞。 ================
    yield take(types.ASYNC_ADD);
    yield fork(workerSaga);
    console.log(11)

}

export function* add1() {
    for (let i = 0; i < 1; i++) {
        yield take(types.ASYNC_ADD);
        yield put({ type: types.ADD });
    }
    console.log('add1 done ');
    return 'add1Result';
}
export function* add2() {
    for (let i = 0; i < 2; i++) {
        yield take(types.ASYNC_ADD);
        yield put({ type: types.ADD });
    }
    console.log('add2 done ');
    return 'add2Result';
}

export default function* rootSaga() {
    // ========== case1 ================
    // yield watcherSaga();

    // ========== case2 类似于 while true,但是不阻塞 ================
    // yield takeEvery(types.ASYNC_ADD, workerSaga);

    // ========= case3 all ================
    // let result = yield all([add1(), add2()]);
    // console.log('done', result);

    // ========= case3 取消 ================
    yield addWatcher();
    // yield requestWatcher();
    // 一个 task 就像是一个在后台运行的进程，在基于redux-saga的应用程序中，可以同时运行多个task
    // 通过 fork 函数来创建 task
    // 监听每一次指定 action 的触发，每次触发时都自动启动一个 worker saga（任务生成器），并发执行，不会阻塞主流程。
    // 让 sagaMiddleware 自动帮你“全局监听”某类 action，每次 action 触发都自动并发执行 worker 任务。
    // 每次 dispatch({type: 'ADD_ASYNC'})，都会自动并发执行一个 addAsync，不会漏掉任何一次 action，也不会阻塞 rootSaga


    // 这句话点击第一次不执行 watcherSaga 内部的第一步是 yield take(types.ASYNC_ADD)，这会让 watcherSaga 再次“等待”下一个 ASYNC_ADD action。
    // 所以第一次点击时，takeEvery 启动 watcherSaga，watcherSaga 进入 take 等待，没做任何事。
    // 第二次点击时，watcherSaga 的 take 收到 action，才会继续往下执行（如 fork workerSaga）
    // yield takeEvery(types.ASYNC_ADD, watcherSaga);
}

export function* addWatcher() {
    function* add() {
        while (true) {
            yield delay(1000); // call(promise, 1000)
            yield put({ type: types.ADD });
        }
    }

    // addWatcher -> 开启新进程运行 add -> 每秒+1
    const task = yield fork(add);
    console.log('task', task);
    // 等待 停止动作
    yield take(types.STOP);
    yield cancel(task);
}



function* requestWatcher() {
    function* request(action) {
        let url = action.payload;
        let promise = fetch(url).then(res => res.json());;
        let res = yield promise;
        console.log(res);
    }

    //action = {type,url}
    const requestAction = yield take(types.REQUEST);
    //开启一个新的子进程发起请求
    const requestTask = yield fork(request, requestAction);
    //立刻开始等待停止请求的动作类型
    const stopAction = yield take(types.STOP_REQUEST);
    yield cancel(requestTask);//在axios里，是通过 调用promise的reject方法来实出任务取消
}