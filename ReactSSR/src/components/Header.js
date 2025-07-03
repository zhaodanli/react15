import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Header() {
  // const { user } = useSelector(state => state.auth)

  return (
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/counter">Counter</Link></li>
      <li><Link to="/user/list">User</Link></li>

      <li><Link to="/profile">个人中心</Link></li>
      <li><Link to="/logout">退出</Link></li>
      <li><Link to="/login">登录</Link></li>
      {/* {
        user ? (
          <>
            <li><Link to="/profile">个人中心</Link></li>
            <li><Link to="/logout">退出</Link></li>
          </>
        ) : <li><Link to="/login">登录</Link></li>
      } */}
    </ul>

  )
}
export default Header