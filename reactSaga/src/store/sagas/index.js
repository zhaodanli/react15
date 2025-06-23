import { put, take, fork } from 'redux-saga/effects';
import * as types from '../action-types';

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function* workerSaga() {
    yield delay(1000);
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
    yield watcherSaga();
}
