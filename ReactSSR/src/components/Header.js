import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// import { getStore } from './store';
import actionCreators from '@/store/actionCreators/auth';

function Header() {
  const { user } = useSelector(state => state.auth)

  const dispatch = useDispatch()

  // 慢，闪动，且是客户端请求
  useEffect(() => {
    dispatch(actionCreators.validate())
  }, [])

  return (
    <ul>
      <li><Link to="/">Home</Link></li>
      <li><Link to="/counter">Counter</Link></li>
      <li><Link to="/user/list">User</Link></li>
      {
        user ? (
          <>
            <li><Link to="/profile">个人中心</Link></li>
            <li><Link to="/logout">退出</Link></li>
          </>
        ) : <li><Link to="/login">登录</Link></li>
      }
    </ul>

  )
}
export default Header