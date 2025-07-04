import React, { useEffect, Suspense, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actionCreators from '@/store/actionCreators/user';

// import LazyUserList from './LazyList';

const LazyUserList = React.lazy(() => import('./LazyList'));

function UserList() {
    const dispatch = useDispatch();
    const resourceRef = useRef();

    if (!resourceRef.current) {
        const promise = dispatch(actionCreators.getUserList());
        const resource = wrapPromise(promise);
        resourceRef.current = resource;
    }

    return (
        <Suspense fallback={<div>loading...</div>}>
            <LazyUserList resource={resourceRef.current} />
        </Suspense>
    )
}

// 当前路由组件在服务器端获取数据的方法
// 1. loadData 如何获取或者加载。（渲染谁执行谁）
// 2. 为什么返回 promise
UserList.loadData = (store) => {
    // 此 promise 完成后，仓库有谁，仓库数据渲染带真是数据的组件的HTML， 在发给客户端
    return store.dispatch(actionCreators.getUserList());
}
export default UserList;


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

// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import actionCreators from '@/store/actionCreators/user';
// function UserList() {
//     const list = useSelector(state => state.user.list);
//     const dispatch = useDispatch();
//     useEffect(() => {
//         if (list.length === 0) {
//             dispatch(actionCreators.getUserList());
//         }
//     }, [])
//     return (
//         <ul>
//             {
//                 list?.map(user => <li key={user.id}>{user.name}</li>)
//             }
//         </ul>
//     )
// }

// // 当前路由组件在服务器端获取数据的方法
// // 1. loadData 如何获取或者加载。（渲染谁执行谁）
// // 2. 为什么返回 promise
// UserList.loadData = (store) => {
//     // 此 promise 完成后，仓库有谁，仓库数据渲染带真是数据的组件的HTML， 在发给客户端
//     return store.dispatch(actionCreators.getUserList());
// }
// export default UserList;