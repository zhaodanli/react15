import * as types from './action-types';

let initState = {
    currentUser: null
}
const reducer = (state = initState, action) => {
    switch (action.type) {
        case types.SET_USER_INFO:
            return { currentUser: action.payload }
        default:
            return state;
    }
}
export default reducer;