import UserLayout from "./";
import React from "react";
import request from '../../utils/request';
import router from 'next/router'

function UserAdd() {
    let nameRef = React.useRef();
    let passwordRef = React.useRef();
    let handleSubmit = async (event) => {
        event.preventDefault();
        let user = {
            name: nameRef.current.value,
            password: passwordRef.current.value,
        };
        let response = await request.post('/api/register', user).then(res => res.data);
        if (response.success) {
            router.push('/user/list');
        } else {
            alert('添加用户失败');
        }
    };
    return (
        <UserLayout>
            <form onSubmit={handleSubmit}>
                用户名:
                <input ref={nameRef} />
                密码:
                <input ref={passwordRef} />
                <button type="submit">添加</button>
            </form>
        </UserLayout>
    );
}

export default UserAdd;