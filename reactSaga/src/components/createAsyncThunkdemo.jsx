import { useEffect } from 'react';
// import { createStore } from 'redux';
// import { configureStore, createAction, createReducer, createSlice, createSelector, createAsyncThunk } from '@reduxjs/toolkit';
import { configureStore, createAction, createReducer, createSlice, createSelector, createAsyncThunk } from './toolkit';
import axios from 'axios';

/** createAsyncThunk 返回 actionCeater, 返回action 给dispatch派发
 * 1. 请求💰： 派发动作 loading true
 * 2. 请求成功给todos
 * 3. 失败报错
 */
export const getTodosList = createAsyncThunk(
    "todos/list", async () => await axios.get(`http://localhost:8080/todos/list`)
);

// 初始状态
const initialState = {
    todos: [],
    loading: false,
    error: null,
};

const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        add() { // 不需要加前缀，自动变为 name+type

        }
    }, // 内部的
    extraReducers: { // 外部的
        [getTodosList.pending]: (state) => {
            state.loading = true;
        },
        [getTodosList.fulfilled]: (state, action) => {
            state.todos = action.payload.data;
            state.loading = false;
        },
        [getTodosList.rejected]: (state, action) => {
            state.todos = [];
            state.error = action.error.message;
            state.loading = false;
        }
    }
})

const { reducer, actions } = todoSlice;
export default function App() {
    const store = configureStore({ reducer })

    useEffect(() => {
        // 返回 promise 为什么
        let promise = store.dispatch(getTodosList());

        console.log('请求开始', store.getState());
        promise.then((response) => {
            console.log('成功', response);
            setTimeout(() => {
                console.log('请求结束', store.getState());
            },);
        }, error => {
            console.log('失败', error);
            setTimeout(() => {
                console.log('请求结束', store.getState());
            },);
        });
    }, [])

    return (
        <div>
        </div>
    )
}





