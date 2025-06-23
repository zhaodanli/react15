import * as effectTypes from './effectTypes'

/** saga 生成器 yield 出“指令”，runSaga 负责解释这些指令，遇到异步就等待，遇到 action 就派发，遇到监听就挂起，遇到子 saga 就递归执行，实现了副作用的可控、可组合、可测试。
 * @param {*} env  env：包含 channel（事件通道）、dispatch（派发 action 的方法）。
 * @param {*} saga 可以是生成器函数或生成器对象
 */
export default function runSaga(env, saga) {

    let { channel, dispatch } = env;

    // saga 生成器的迭代器，如果是迭代器直接执行 传入 saga 时既可以是生成器函数，也可以是已经执行过的生成器对象。
    // 生成器函数 需要调用 saga() 得到生成器对象（迭代器）
    // saga 也可能已经是生成器对象（如 rootSaga() 的返回值），此时可以直接用。
    let it = typeof saga === 'function' ? saga() : saga;

    // next 执行器 每次调用 next()，推进 saga 生成器，拿到下一个 effect（副作用指令）。
    function next(value) {
        let { value: effect, done } = it.next(value);
        if (!done) {
            if (typeof effect[Symbol.iterator] === 'function') {
                // 如果 yield 出来的是另一个生成器（子 saga），递归调用 runSaga 执行它，同时当前 saga 继续往下走（并发）。
                runSaga(env, effect);
                next(); // 不阻塞当前 saga，继续往下走
            } else if (effect instanceof Promise) {
                // 如果 yield 出来的是 Promise，等 Promise 完成后再继续执行 next。
                effect.then(next);
            } else {
                // 指令类型分发
                switch (effect.type) {
                    case effectTypes.TAKE:
                        // TAKE：监听某个 actionType，等 channel.emit 触发后再继续 saga。 take 直接监听 emit 触发时执行一次
                        channel.once(effect.actionType, next);
                        break;
                    case effectTypes.PUT:
                        // 同步的 PUT：立即 dispatch 一个 action，然后继续 saga。
                        dispatch(effect.action);
                        next();
                        break;
                    default:
                        break;
                }
            }

        }
    }

    // 启动
    next();
}