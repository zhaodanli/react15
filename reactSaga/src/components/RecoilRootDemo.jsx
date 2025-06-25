import React, { useState } from 'react';
import { atom, useRecoilState } from '../recoil';

const todoListState = atom({
    key: 'todoList',
    default: [],
});

export default function RecoilRootDemo() {
    const [todoList, setTodoList] = useRecoilState(todoListState);

    const [input, setInput] = useState('');

    const addTodo = () => {
        setTodoList([...todoList, input]);
        setInput('');
    };

    return (
        <div>
            <input value={input} onChange={(event) => setInput(event.target.value)} /><button onClick={addTodo}>添加</button>
            <ul>
                {
                    todoList.map((item) => (
                        <li key={item}>{item}</li>
                    ))
                }
            </ul>
        </div>
    );
}