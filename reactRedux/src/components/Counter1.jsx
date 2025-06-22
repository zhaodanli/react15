import React, { Component } from 'react';
import { createStore, bindActionCreators } from '../redux';

const ADD = 'ADD';
const MINUS = 'MINUS';

const reducer = (state = initState, action) => {
  switch (action.type) {
    case ADD:
      return { number: state.number + 1 };
    case MINUS:
      return { number: state.number - 1 };
    default:
      return state;
  }
}
let initState = { number: 0 };
const store = createStore(reducer, initState);

function add() {
    return { type: 'ADD' };
}
function minus() {
    return { type: 'MINUS' };
}
const actions = { add, minus };
const boundActions = bindActionCreators(actions, store.dispatch);

export default class App extends Component {

  // unsubscribe;

  constructor(props) {
    super(props);
    this.state = { number: 0 };
  }

  componentDidMount() {
    this.unsubscribe = store.subscribe(() => {
      let state = store.getState()
      this.setState({ number: state.number })
    });
  }

  componentWillUnmount() {
    console.log('componentWillUnmount')
    this.unsubscribe();
  }

  render() {
    return (
      <div>
        <p>{this.state.number}</p>
        {/* <button onClick={() => store.dispatch({ type: 'ADD' })}>+</button>
        <button onClick={() => store.dispatch({ type: 'MINUS' })}>-</button> */}
        <button onClick={boundActions.add}>+</button>
        <button onClick={boundActions.minus}>-</button>
        {/* <button onClick={
          () => {
            setTimeout(() => {
              store.dispatch({ type: 'ADD' });
            }, 1000);
          }
        }>1秒后加1</button> */}
      </div>
    )
  }
}