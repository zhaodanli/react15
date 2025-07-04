import UserLayout from "./";
import React from "react";

function UserAdd() {
    let nameRef = React.useRef();
    let passwordRef = React.useRef();
    let handleSubmit = (event) => {
        event.preventDefault();
        let user = {
            name: nameRef.current.value,
            password: passwordRef.current.value,
        };
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