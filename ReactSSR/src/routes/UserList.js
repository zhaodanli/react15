import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actionCreators from '@/store/actionCreators/user';
function UserList() {
    const list = useSelector(state => state.user.list);
    const dispatch = useDispatch();
    useEffect(() => {
        if (list.length === 0) {
            dispatch(actionCreators.getUserList());
        }
    }, [])
    return (
        <ul>
            {
                list?.map(user => <li key={user.id}>{user.name}</li>)
            }
        </ul>
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