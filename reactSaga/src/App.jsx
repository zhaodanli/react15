import { useEffect } from 'react';
// import { createStore } from 'redux';
// import { configureStore } from '@reduxjs/toolkit';
import { configureStore, createAction, createReducer, createSlice, createSelector } from './toolkit';

// const add = createAction('ADD')
// (amount) => ({ payload: amount * 20 }) 准备函数
// const minus = createAction('MINUS', (amount) => ({ payload: amount * 20 }))

// const reducer = (state = { number: 0 }, action) => {
//     switch (action.type) {
//         case add.type:
//             return { number: state.number + 1 }
//         case minus.type:
//             return { number: state.number - action.payload }
//         default:
//             return state
//     }
// }

// const reducer = createReducer({ number: 0 }, {
//     [add]: state => ({ number: state.number + 1 }),
//     [minus]: state => ({ number: state.number - 1 })
// })

// console.log(add.toString());
// console.log(minus.toString());

const counterSlice = createSlice({
    name: 'counter',
    initialState: { number: 0 },
    reducers: {
        // add: (state) => ({ number: state.number + 1 }),//派发的时候动作类型是 counter/add
        // minus: (state, action) => ({ number: state.number - action.payload })
        add: (state) => state.number += 1,//派发的时候动作类型是 counter/add
        minus: (state, action) => state.number -= action.payload
    }
})

const { actions: { add, minus }, reducer } = counterSlice;

const counterSlice2 = createSlice({
    name: 'counter2',
    initialState: { number: 0 },
    reducers: {
        add2: (state) => state.number += 1,//派发的时候动作类型是 counter/add
        minus2: (state, action) => state.number -= action.payload
    }
})

const { actions: { add2, minus2 }, reducer: reducer2 } = counterSlice2;

// let store = createStore(reducer);
const store = configureStore({
    reducer: { counter: reducer, counter2: reducer2 },
})

const selectCounter = state => state.counter
const selectCounter2 = state => state.counter2

const totalSelector = createSelector(
    [selectCounter, selectCounter2],
    (counter, counter2) => {
        return counter.number + counter2.number;
    }
)

function render() {
    const valueEl = document.getElementById('value');
    const valueEl2 = document.getElementById('value2');
    const sumEl = document.getElementById('sum');

    if (valueEl) {
        valueEl.innerHTML = store.getState().counter.number;
        valueEl2.innerHTML = store.getState().counter2.number;
        sumEl.innerHTML = totalSelector(store.getState());
    }
}

export default function App() {

    useEffect(() => {
        render(); // 首次渲染

        const unsubscribe = store.subscribe(render);

        const addBtn = document.getElementById('add');
        const minusBtn = document.getElementById('minus');
        const asyncAddBtn = document.getElementById('async-add');

        const addBtn2 = document.getElementById('add2');
        const minusBtn2 = document.getElementById('minus2');

        const handleAdd = () => store.dispatch(add());
        const handleMinus = () => store.dispatch(minus(2));
        const handleAsyncAdd = () => store.dispatch((dispatch) => {
            setTimeout(() => {
                dispatch(add())
            }, 1000)
        });

        const handleAdd2 = () => store.dispatch(add2());
        const handleMinus2 = () => store.dispatch(minus2(2));

        if (addBtn) addBtn.addEventListener('click', handleAdd);
        if (minusBtn) minusBtn.addEventListener('click', handleMinus);
        if (asyncAddBtn) asyncAddBtn.addEventListener('click', handleAsyncAdd)

        if (addBtn2) addBtn2.addEventListener('click', handleAdd2);
        if (minusBtn2) minusBtn2.addEventListener('click', handleMinus2);

        return () => {
            unsubscribe();
            if (addBtn) addBtn.removeEventListener('click', handleAdd);
            if (minusBtn) minusBtn.removeEventListener('click', handleMinus);
            if (asyncAddBtn) asyncAddBtn.removeEventListener('click', handleMinus);

            if (addBtn2) addBtn2.removeEventListener('click', handleAdd);
            if (minusBtn2) minusBtn2.removeEventListener('click', handleMinus);
            if (asyncAddBtn2) asyncAddBtn2.removeEventListener('click', handleMinus);
        };
    }, [])

    return (
        <div>
            <p id="value">0</p>
            <button id="add">+</button>
            <button id="minus">-</button>
            <button id="async-add">async-add</button>
            <hr />
            <p id="value2">0</p>
            <button id="add2">+</button>
            <button id="minus2">-</button>
            <hr />
            <p id="sum">0</p>
        </div>
    )
}





