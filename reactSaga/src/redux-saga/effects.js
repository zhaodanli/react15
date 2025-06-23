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