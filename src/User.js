import React from 'react';

const isServer = typeof window === 'undefined';

/**
 * 服务端和客户端渲染的内容不一致
 * 你的 User.js 里，fetchUser 是在模块作用域直接发起的，导致 SSR 阶段和 CSR 阶段的“挂起/数据状态”不一致。
 * SSR 首屏输出的是 <Suspense fallback>（loading User...），而客户端一进来就会立刻挂起，等待 10 秒后才渲染 <div>ID:1</div>。
 * 这样 SSR 首屏 HTML 是 loading，CSR 首屏是挂起（没有 loading），等数据好后才渲染 ID:1，导致 hydration mismatch。
 */
// 最佳实践是：不要在 User 组件里用 typeof window 判断分支渲染 fallback，而是让 Suspense 机制统一处理。
let userResource;
// if (!isServer) {
//     // 只在客户端挂起
//     const userPromise = fetchUser(1);
//     userResource = wrapPromise(userPromise);
// }

const userPromise = fetchUser(1);
userResource = wrapPromise(userPromise);

function User() {
    // SSR 阶段直接渲染 fallback 结构，保证 SSR/CSR 一致
    // if (isServer) {
    //     return <div>loading User...</div>;
    // }

    const user = userResource.read();
    return <div>ID:{user.id}</div>;
}
export default User;

function fetchUser(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ id });
        }, 2000);
    });
}
function wrapPromise(promise) {
    let status = "pending";
    let result;
    let suspender = promise.then(
        (r) => {
            status = "success";
            result = r;
        },
        (e) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        }
    };
}