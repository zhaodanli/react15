import { createStore } from 'redux';
import reducer from './reducer';

export default function (initialState) {
    return createStore(reducer, initialState);
}