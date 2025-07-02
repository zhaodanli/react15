import React from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import actionCreators from '@/store/actionCreators/counter';

function Counter() {
    const number = useSelector(state => state.counter.number);
    const dispatch = useDispatch();
    return (
        <div>
            <p>{number}</p>
            <button onClick={() =>  dispatch(actionCreators.add())}>+</button>
        </div>
    )
}
export default Counter;