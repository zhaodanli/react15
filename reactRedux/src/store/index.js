import { createStore } from '../redux';
import reducer from './reducers/counter1.js';

let initState = { number: 0 };
const store = createStore(reducer, initState);
export default store;