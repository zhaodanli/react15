import { createReducer, createAction } from './'

function createSlice(options) {
    let { 
        name, 
        initialState = {}, 
        reducers = {},
        extraReducers={} 
    } = options;

    let actions = {};
    const prefixReducers = {};

    Object.keys(reducers).forEach(function (key) {
        var type = getType(name, key);
        // { type: counter/add fn: {} }
        actions[key] = createAction(type);
        // 更新reducer的名字
        prefixReducers[type] = reducers[key];
    })
    // reducers[key] 用来处理状态
    // let reducer = createReducer(initialState, reducers);
    let reducer = createReducer(initialState, prefixReducers, extraReducers);

    return {
        name,
        reducer,
        actions
    };
}
function getType(slice, actionKey) {
    return slice + "/" + actionKey;
}
export default createSlice;