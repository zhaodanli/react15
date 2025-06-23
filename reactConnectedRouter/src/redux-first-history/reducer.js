import { LOCATION_CHANGE } from './actions';


/** createRouterReducer(history)：生成一个 reducer。
只处理 LOCATION_CHANGE action，把最新的 location 和 action 同步到 redux 仓库的 router 分支。
这样组件可以通过 redux 读取当前路由状态。
 * 
 * @param {*} history 
 * @returns 
 */
export function createRouterReducer(history) {
    const initialState = {
        action: history.action,
        location: history.location
    }

    return function (state = initialState, action) {
        if (action.type === LOCATION_CHANGE) {
            return { ...state, location: action.payload.location, action: action.payload.action };
        } else {
            return state;
        }
    }
}