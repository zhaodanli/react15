import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actionCreators from '@/store/actionCreators/auth';

function Login() {
  const list = useSelector(state => state.user.list);

  const dispatch = useDispatch();
  const nameRef = useRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    const name = nameRef.current.value;
    dispatch(actionCreators.login({ name }));
  }

  return (
    <form onSubmit={handleSubmit}>
        用户名 <input ref={nameRef} />
        <input type="submit"></input>
    </form>
  )
}
export default Login;