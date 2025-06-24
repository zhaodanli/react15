import * as immer from 'immer';

let { produce } = immer.default || immer;

function createReducer(initialState, reducers = {}) {
    return function (state = initialState, action) {
        let reducer = reducers[action.type];
        if (reducer) {
            return produce(state, draft => {
                reducer(draft, action);
            });
        }
        if (reducer) return reducer(state, action);
        return state;
    }
}
export default createReducer;