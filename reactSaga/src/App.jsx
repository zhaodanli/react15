import { useEffect } from 'react';
// import { createStore } from 'redux';
// import { configureStore } from '@reduxjs/toolkit';
import { configureStore } from './toolkit';

const ADD = 'ADD'
const MINUS = 'MINUS'

function add() {
    return { type: ADD }
}

function minus() {
    return { type: MINUS }
}

const reducer = (state = { number: 0 }, action) => {
    switch (action.type) {
        case ADD:
            return { number: state.number + 1 }
        case MINUS:
            return { number: state.number - 1 }
        default:
            return state
    }
}

// let store = createStore(reducer);
const store = configureStore({
    reducer,
    // preloadedState: {

    // }
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
        const handleMinus = () => store.dispatch(minus());
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





