function add1(str) {
    return '1' + str;
}
function add2(str) {
    return '2' + str;
}
function add3(str) {
    return '3' + str;
}

// 但 compose2 里 (...args) => a(b(...args)) 这种写法和柯里化的思想有点类似（都是返回函数），但本质是“高阶函数”而不是“柯里化”。
// 把一个多参数函数，转化为一系列只接受一个参数的函数链式调用。
// function compose(...funcs) {
//     return function (args) {
//         for (let i = funcs.length - 1; i >= 0; i--) {
//             args = funcs[i](args);
//         }
//         return args;
//     }
// }

// compose2(a, b, c) 变成 (...args) => a(b(c(...args)))
// 执行顺序：先执行 c('X') 得 'Xc'，再 b('Xc') 得 'Xcb'，最后 a('Xcb') 得 'Xcba'
function compose(...funcs) {
    return funcs.reduce((a, b) => {
        return (...args) => {
            return a(b(...args))
        }
    });
}
/**
 *第一次 a=add3 b=add2 => (...args)=>add3(add2(...args))
 *第二次 a=(...args)=>add3(add2(...args)) b=add1 => (...args)=>add3(add2((add1(...args)))))
 */
// let fn = compose(add3, add2, add1);
// let result = fn('zhufeng');
// console.log(result);

let promise = (next) => action => {
    console.log('promise');
    next(action);
};
let thunk = (next) => action => {
    console.log('thunk');
    next(action);
};
let logger = (next) => action => {
    console.log('logger');
    next(action);
};

let chain = [promise, thunk, logger];
// compose(...chain) 会把这些中间件从右到左组合成一个大函数
// 实际上等价于：composed(dispatch) = promise(thunk(logger(dispatch)))
// 洋葱模型：最外层是 promise，包裹 thunk，包裹 logger，包裹原始 dispatch。
let composed = compose(...chain)
let dispatch = () => {
    console.log('原始的dispatch');
}
// dispatch 是原始的 dispatch 函数。
// newDispatch 是被所有中间件包裹后的 dispatch。
// promise 中间件先接收到 action，做自己的处理，然后调用下一个（thunk）。
// thunk 中间件接收到 action，做自己的处理，然后调用下一个（logger）。
// logger 中间件接收到 action，做自己的处理，然后调用下一个（原始 dispatch）。
// 原始 dispatch 最终执行，打印 '原始的dispatch'。
// 每个中间件都可以在 action 传递前后做自己的逻辑（如日志、异步、拦截等），最后 action 一定会传递到最原始的 dispatch。
let newDispatch = composed(dispatch);
newDispatch({ type: "add" });