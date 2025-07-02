import React from 'react';
import { Link, Outlet } from 'react-router-dom';
function User() {
    return (
        <>
            <ul>
                <li><Link to="/user/add">UserAdd</Link></li>
                <li><Link to="/user/list">UserList</Link></li>
            </ul>
            <Outlet />
        </>
    )
}
export default User;