import { combineReducers } from 'redux'
import counter from './counter';
import { routerReducer } from '../../history';

// routerReducer 是个 reducer, 在这里还需要绑定 routerReducer
let reducers = {
    counter,
    router: routerReducer
};
export default combineReducers(reducers);