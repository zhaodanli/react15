import { useEffect } from 'react';
import { createStore } from 'redux';

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

let store = createStore(reducer);

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
        const handleAdd = () => store.dispatch(add());
        const handleMinus = () => store.dispatch(minus());
        if (addBtn) addBtn.addEventListener('click', handleAdd);
        if (minusBtn) minusBtn.addEventListener('click', handleMinus);
        return () => {
            unsubscribe();
            if (addBtn) addBtn.removeEventListener('click', handleAdd);
            if (minusBtn) minusBtn.removeEventListener('click', handleMinus);
        };
    }, [])

    return (
        <div>
            <p id="value">0</p>
            <button id="add">+</button>
            <button id="minus">-</button>
        </div>
    )
}





