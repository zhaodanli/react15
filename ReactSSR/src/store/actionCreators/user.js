import { SET_USER_LIST, ADD_USER } from '../action-types';
import axios from 'axios';

const actions = {
  getUserList() {
    return function (dispatch, getState, request) {
      // return axios.get('http://localhost:8080/users').then((response) => {
      return axios.get('/api/users').then((response) => {
      // return request.get('/api/users').then((response) => {
        const data = response.data;
        dispatch({
          type: SET_USER_LIST,
          payload: data
        });
      });
    }
  },
  addUser(user) {
    return { type: ADD_USER, payload: user }
  }
}
export default actions;