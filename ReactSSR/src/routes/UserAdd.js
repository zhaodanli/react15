import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import actionCreators from '@/store/actionCreators/user';

function UserAdd() {
    const list = useSelector(state => state.user.list);
    const nameRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const handleSubmit = (event) => {
        event.preventDefault();
        const name = nameRef.current.value;
        dispatch(actionCreators.addUser({ id: Date.now(), name }));
        navigate('/User/List');
    }
    return (
        <form onSubmit={handleSubmit}>
            用户名 <input ref={nameRef} />
            <input type="submit"></input>
        </form>
    )
}
export default UserAdd;