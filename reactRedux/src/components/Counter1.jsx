import React, { Component } from 'react';
import { bindActionCreators } from '../redux';
import actions from '../store/actions/counter1'
import store from '../store';
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
        <button onClick={boundActions.add1}>+</button>
        <button onClick={boundActions.minus1}>-</button>
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