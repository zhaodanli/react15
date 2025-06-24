import { useEffect } from 'react';
// import { createStore } from 'redux';
// import { configureStore } from '@reduxjs/toolkit';
import { configureStore, createAction } from './toolkit';

const add = createAction('ADD')
// (amount) => ({ payload: amount * 20 }) 准备函数
const minus = createAction('MINUS', (amount) => ({ payload: amount * 20 }))

const reducer = (state = { number: 0 }, action) => {
    switch (action.type) {
        case add.type:
            return { number: state.number + 1 }
        case minus.type:
            return { number: state.number - action.payload }
        default:
            return state
    }
}

console.log(add.toString());
console.log(minus.toString());

// let store = createStore(reducer);
const store = configureStore({
    reducer,
    preloadedState: {
        number: 0
    }
})

function render() {
    const valueEl = document.getElementById('value');
    if (valueEl) {
        valueEl.innerHTML = store.getState().number;
    }
}

export default function App() {

    useEffect(() => {
        render(); // 首次渲染
        const unsubscribe = store.subscribe(render);

        const addBtn = document.getElementById('add');
        const minusBtn = document.getElementById('minus');
        const asyncAddBtn = document.getElementById('async-add');

        const handleAdd = () => store.dispatch(add());
        const handleMinus = () => store.dispatch(minus(2));
        const handleAsyncAdd = () => store.dispatch((dispatch) => {
            setTimeout(() => {
                dispatch(add())
            }, 1000)
        });

        if (addBtn) addBtn.addEventListener('click', handleAdd);
        if (minusBtn) minusBtn.addEventListener('click', handleMinus);
        if (asyncAddBtn) asyncAddBtn.addEventListener('click', handleAsyncAdd)

        return () => {
            unsubscribe();
            if (addBtn) addBtn.removeEventListener('click', handleAdd);
            if (minusBtn) minusBtn.removeEventListener('click', handleMinus);
            if (asyncAddBtn) asyncAddBtn.removeEventListener('click', handleMinus);
        };
    }, [])

    return (
        <div>
            <p id="value">0</p>
            <button id="add">+</button>
            <button id="minus">-</button>
            <button id="async-add">async-add</button>
        </div>
    )
}





