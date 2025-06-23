
/** 定义了与路由相关的 action 类型和 action creator。
 * 
 */

// 调用历史对象的方法 用于描述“调用 history 对象方法”的 action（如 push、replace）。
export const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD';
// 当路径变更后会派发这个动作给仓库，让仓库中reducer把最新的路径放入仓库状态中
// 每当路由变化时，reducer 会用它同步最新的 location 到 redux 仓库。
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

// 生成 LOCATION_CHANGE action。
export function locationChangeAction(location, action) {
    return {
        type: LOCATION_CHANGE,
        payload: { action, location }
    }
}

// 生成如 push 这样的 action creator，描述“调用 history.push(args)”
function updateLocation(method) {
    return (...args) => {
        return {
            type: CALL_HISTORY_METHOD,
            payload: { method, args }
        }
    }
}

// 一个 action creator，触发后会被中间件拦截并调用 history.push。
export const push = updateLocation('push');