import { put, take } from '../redux-saga/effects';
import * as types from './action-types';

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function* workerSaga() {
    yield delay(1000);
    yield put({ type: actionTypes.ADD });
}

function* watcherSaga() {
    while(true) {
        // 产出 effect 等待有人嫌仓库派发动作，等到了就会向下执行
        yield take(actionTypes.ASYNC_ADD);
        yield workerSaga();
    }
    console.log(221323) // while(true) 这行代码用于啊不会执行
}

export default function* rootSaga() {
    yield watcherSaga();
}
