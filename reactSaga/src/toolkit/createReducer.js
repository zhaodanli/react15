import * as immer from 'immer';

let { produce } = immer.default || immer;

function createReducer(initialState, reducers = {}, extraReducers={}) {
    return function (state = initialState, action) {
        let reducer = reducers[action.type];
        // if (reducer) return reducer(state, action);
        if (reducer) {
            return produce(state, draft => {
                reducer(draft, action);
            });
        }

        let extraReducer = extraReducers[action.type];
        if (extraReducer) {
            return produce(state, draft => {
                extraReducer(draft, action);
            });
        }

        
        return state;
    }
}
export default createReducer;