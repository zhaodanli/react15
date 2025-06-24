function createReducer(initialState, reducers = {}) {
    return function (state = initialState, action) {
        let reducer = reducers[action.type];
        if (reducer) return reducer(state, action);
        return state;
    }
}
export default createReducer;