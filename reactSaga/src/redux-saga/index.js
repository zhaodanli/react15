import EventEmitter from 'events';
import runSaga from './runSaga';

/** 函数执行返回中间件
 * run 执行saga
 * @returns 
 */
export default function createSagaMiddleware() {
    // 创建管道、事件发射器
    let channel = new EventEmitter();
    let boundRunSaga;

    // 返回的中间件
    function sagaMiddleware({ getState, dispatch }) {

        // 处理 saga = { channel, dispatch, getState }
        boundRunSaga = runSaga.bind(null, { channel, dispatch, getState });

        return function (next) {
            // action = dispatch
            return function (action) {
                const result = next(action);
                // 发射事件，动作类型， type action -> 监听 -> next
                channel.emit(action.type, action);
                return result;
            }
        }
    }

    // sagaMiddleware.run = (saga) => runSaga(saga);
    sagaMiddleware.run = (saga) => boundRunSaga(saga);
    return sagaMiddleware;
}