// rootSaga 生成器
// 这是一个生成器函数（function*），每次 next() 会产出一个“指令”。
// 第一条指令：{ type: 'PUT', action: { type: "ADD" } }，模拟向 redux 派发 action。
// 第二条指令：new Promise(resolve => setTimeout(resolve, 3000))，模拟异步延迟。
// 第三条指令：{ type: 'PUT', action: { type: "MINUS" } }，再派发一个 action。
function* rootSaga() {
    // 每次执行next会产出一个effect(指令对象)
    // type用来区分不同的指令 ，比如说PUT是表示想向仓库派发一个action 
    yield { type: 'PUT', action: { type: "ADD" } };
    // 还可以产出一个promise
    yield new Promise(resolve => setTimeout(resolve, 3000))
    yield { type: 'PUT', action: { type: "MINUS" } };
}

// runSaga 执行器
// runSaga 接收一个 saga 生成器，得到迭代器 it。
// next() 递归执行每一步：
// 如果产出的是 Promise，等 Promise 完成后再继续。
// 如果产出的是 PUT 指令，打印“派发动作”，然后继续。
// 其他情况直接继续。
function runSaga(saga) {
    //执行生成器，得到迭代器
    const it = saga();
    function next() {
        const { done, value: effect } = it.next();
        if (!done) {
            if (effect instanceof Promise) {
                effect.then(next);
            } else if (effect.type === 'PUT') {
                console.log(`向仓库派发一个动作${JSON.stringify(effect.action)}`);
                next();
            } else {
                next();
            }
        }
    }
    next();
}

/** 指令驱动副作用”机制
 * 用生成器（yield）描述副作用流程，每一步产出一个“指令”。
用执行器（runSaga）解释这些指令，遇到异步就等待，遇到 action 就派发。
这就是 redux-saga 的核心原理：副作用流程可暂停、可组合、可测试
 */
runSaga(rootSaga);

function * gen(){
    yield 1;
    yield 2;
    yield 3;
}
let it = gen();
console.log(it[Symbol.iterator]);
let r1 = it.next();
console.log(r1);
let r2 = it.next();
// let r2 = it.throw();
// let r2 = it.return();
console.log(r2);
let r3 = it.next();
console.log(r3);
let r4 = it.next();
console.log(r4);