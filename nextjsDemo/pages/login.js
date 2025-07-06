import React from 'react';
import request from '@/utils/request';
import router from 'next/router';
import { connect } from 'react-redux';
import * as types from '@/store/action-types';

function Login(props) {
    let nameRef = React.useRef();
    let passwordRef = React.useRef();
    let handleSubmit = async (event) => {
        event.preventDefault();
        let user = { name: nameRef.current.value, password: passwordRef.current.value };
        let response = await request.post('/api/login', user).then(res => res.data);
        if (response.success) {
            props.dispatch({ type: types.SET_USER_INFO, payload: response.data });
            router.push('/');
        } else {
            alert('登录失败');
        }
    }
    return (
        <form onSubmit={handleSubmit}>
            用户名:<input ref={nameRef} />
            密码:<input ref={passwordRef} />
            <button type="submit">登录</button>
        </form>
    )
}

export default connect(state => state)(Login);