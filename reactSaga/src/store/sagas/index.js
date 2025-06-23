import { put, take, fork, takeEvery, call, cps } from './../../redux-saga/effects';
import * as types from '../action-types';


/** call 用于处理返回 Promise 的异步函数（或同步函数）。
 * 你可以 yield call(fn, ...args)，saga 会自动执行 fn(...args)，如果返回 Promise 会等待其 resolve。
 * 适合现代 async/await、Promise 风格的异步代码。
 *  cps 用于处理Node.js 风格的回调异步函数，即最后一个参数是 callback(err, result)。
 *  yield cps(fn, ...args)，saga 会自动把 next 作为 callback 传给 fn。
 * 适合老式 Node.js API 或 callback 风格的异步代码。 代前端开发推荐优先用 call，只有遇到 callback 风格的库才用 cps。
 * @param {*} ms 
 * @param {*} callback 
 */
// function delay(ms) {
//     return new Promise((resolve) => {
//         setTimeout(resolve, ms);
//     });
// }

function delay(ms, callback) {
    setTimeout(() => callback(null,'ok'), ms);
}

export function* add() {
    let data = yield cps(delay,1000);
    console.log(data);
    yield put({ type: types.ADD });
}

function* workerSaga() {
    // yield delay(1000);
    yield call(delay,1000);
    yield put({ type: types.ADD });
}

function* watcherSaga() {
    // take 职能监听一次
    // while(true) {
    //     // 产出 effect 等待有人嫌仓库派发动作，等到了就会向下执行
    //     yield take(types.ASYNC_ADD);
    //     yield workerSaga();
    // }
    
    // 解决方案 fork 让 saga 支持“并发”，主流程和子流程互不阻塞。
    const action = yield take(types.ASYNC_ADD);
    yield fork(workerSaga);

    console.log(221323) // while(true) 这行代码用于啊不会执行
}

export default function* rootSaga() {
    // yield watcherSaga();
    // 一个 task 就像是一个在后台运行的进程，在基于redux-saga的应用程序中，可以同时运行多个task
    // 通过 fork 函数来创建 task
    // 监听每一次指定 action 的触发，每次触发时都自动启动一个 worker saga（任务生成器），并发执行，不会阻塞主流程。
    // 让 sagaMiddleware 自动帮你“全局监听”某类 action，每次 action 触发都自动并发执行 worker 任务。
    // 每次 dispatch({type: 'ADD_ASYNC'})，都会自动并发执行一个 addAsync，不会漏掉任何一次 action，也不会阻塞 rootSaga
    yield takeEvery(types.ASYNC_ADD, add);

    // 这句话点击第一次不执行 watcherSaga 内部的第一步是 yield take(types.ASYNC_ADD)，这会让 watcherSaga 再次“等待”下一个 ASYNC_ADD action。
    // 所以第一次点击时，takeEvery 启动 watcherSaga，watcherSaga 进入 take 等待，没做任何事。
    // 第二次点击时，watcherSaga 的 take 收到 action，才会继续往下执行（如 fork workerSaga）
    // yield takeEvery(types.ASYNC_ADD, watcherSaga);
}
