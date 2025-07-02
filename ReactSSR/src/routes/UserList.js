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
                list.map(user => <li key={user.id}>{user.name}</li>)
            }
        </ul>
    )
}
export default UserList;