import * as effectTypes from './effectTypes';
const TASK_CANCEL = 'TASK_CANCEL';

/** saga 生成器 yield 出“指令”，runSaga 负责解释这些指令，遇到异步就等待，遇到 action 就派发，遇到监听就挂起，遇到子 saga 就递归执行，实现了副作用的可控、可组合、可测试。
 * @param {*} env  env：包含 channel（事件通道）、dispatch（派发 action 的方法）。
 * @param {*} saga 可以是生成器函数或生成器对象
 */
export default function runSaga(env, saga, callback) {
    let task = { cancel: () => next(TASK_CANCEL) };

    let { channel, dispatch } = env;

    // saga 生成器的迭代器，如果是迭代器直接执行 传入 saga 时既可以是生成器函数，也可以是已经执行过的生成器对象。
    // 生成器函数 需要调用 saga() 得到生成器对象（迭代器）
    // saga 也可能已经是生成器对象（如 rootSaga() 的返回值），此时可以直接用。
    let it = typeof saga === 'function' ? saga() : saga;

    // next 执行器 每次调用 next()，推进 saga 生成器，拿到下一个 effect（副作用指令）。
    function next(value, isErr) {

        let result;
        if (isErr) {
            result = it.throw(value);
        } else if (value === TASK_CANCEL) {
            // 如果是取消任务直接结束
            result = it.return(value);
        } else {
            result = it.next(value);
        }

        // let { value: effect, done } = it.next(value);
        let { value: effect, done } = result;
        if (!done) {
            if (typeof effect[Symbol.iterator] === 'function') {
                // 如果 yield 出来的是另一个生成器（子 saga），递归调用 runSaga 执行它，同时当前 saga 继续往下走（并发）。
                runSaga(env, effect);
                next(); // 不会阻止当前saga继续向后走
            } else if (effect instanceof Promise) {
                // 如果 yield 出来的是 Promise，等 Promise 完成后再继续执行 next。
                effect.then(next);
            } else {
                console.log('注册 take 监听', effect.type);
                switch (effect.type) {
                    case effectTypes.TAKE:
                        // TAKE：监听某个 actionType，等 channel.emit 触发后再继续 saga。 take 直接监听 emit 触发时执行一次
                        channel.once(effect.actionType, next);
                        break;
                    case effectTypes.PUT:
                        dispatch(effect.action);
                        next();
                        break;
                    case effectTypes.FORK: // 并发执行
                        // 返回回调供取消
                        let forkTask = runSaga(env, effect.saga); // 启动子 saga
                        next(forkTask); // 主 saga 继续往下走
                        break;
                    case effectTypes.CALL:
                        // effect.fn(...effect.args) 实际上就是调用你要执行的异步函数，比如 fetchData(1, 2)。
                        // 这个函数通常返回一个 Promise（比如你用 async/await 或 fetch、axios 等异步请求）。
                        // Promise 实例有 then 方法，所以可以 .then(next)，等异步完成后继续推进 saga。
                        effect.fn(...effect.args).then(next);
                        break;
                    case effectTypes.CPS:
                        effect.fn(...effect.args, (err, data) => {
                            if (err) {
                                next(err, true);
                            } else {
                                next(data);
                            }
                        });
                        break;
                    case effectTypes.ALL:
                        const { iterators } = effect;
                        let result = [];
                        let count = 0;
                        iterators.forEach((iterator, index) => {
                            runSaga(env, iterator, (data) => {
                                result[index] = data;
                                if (++count === iterators.length) {
                                    next(result);
                                }
                            });
                        });
                        break;
                    case effectTypes.CANCEL:
                        effect.task.cancel();
                        next();
                        break;
                    default:
                        break;
                }
            }

        } else {
            callback && callback(effect);
        }
    }

    // 启动
    next();
    return task;
}