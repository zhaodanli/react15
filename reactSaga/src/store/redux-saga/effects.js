import * as effectTypes from './effectTypes'

export function take(actionType) {
    return { type: effectTypes.TAKE, actionType }
}

export function put(action) {
    return { type: effectTypes.PUT, action }
}

export function fork(saga) {
    return { type: effectTypes.FORK, saga };
}

/** 本质是fork包裹while true */
export function takeEvery(actionType, saga) {
    function* takeEveryHelper() {
        while (true) {
            yield take(actionType);
            yield fork(saga);
        }
    }
    return fork(takeEveryHelper);
}

export function call(fn, ...args) {
    return { type: effectTypes.CALL, fn, args };
}

export function cps(fn, ...args) {
    return { type: effectTypes.CPS, fn, args };
}

export function all(iterators) {
    return { type: effectTypes.ALL, iterators };
}

const delayFn = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}

export function delay(...args) {
    return call(delayFn, ...args);
}

export function cancel(task) {
    return { type: effectTypes.CANCEL, task };
}