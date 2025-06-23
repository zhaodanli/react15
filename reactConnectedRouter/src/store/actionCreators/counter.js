import * as actionTypes from '../action-types';
const actionCreators = {
    add() {
        return { type: actionTypes.ADD }
    },
    minus() {
        return { type: actionTypes.MINUS }
    }
}
export default actionCreators