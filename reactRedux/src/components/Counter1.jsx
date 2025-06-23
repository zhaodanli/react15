import React, { Component } from 'react';
import actions from '../store/actions/counter1';
import { connect } from '../react-redux';

class Counter1 extends Component {

  // unsubscribe;

  // constructor(props) {
  //   super(props);
  //   this.state = { number: 0 };
  // }

  // componentDidMount() {
  //   this.unsubscribe = store.subscribe(() => {
  //     let state = store.getState().counter1
  //     this.setState({ number: state.number })
  //   });
  // }

  // componentWillUnmount() {
  //   console.log('componentWillUnmount')
  //   this.unsubscribe();
  // }

  render() {
    let { number, add1, minus1, thunkAdd1, promiseAdd1, promiseAdd2 } = this.props;
    return (
      <div>
        <p>Counter1: {number}</p>
        {/* <button onClick={() => store.dispatch({ type: 'ADD' })}>+</button>
        <button onClick={() => store.dispatch({ type: 'MINUS' })}>-</button> */}
        {/* bind reducer之后 */}
        {/* <button onClick={boundActions.add1}>+</button>
        <button onClick={boundActions.minus1}>-</button> */}
        {/* 使用 provider之后 */}
        <button onClick={add1}>+</button>
        <button onClick={minus1}>-</button>
        <button onClick={thunkAdd1}>thunk+1</button>
        <button onClick={promiseAdd1}>promise+1</button>
        <button onClick={promiseAdd2}>promise+2</button>
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

// let state = store.getState().counter1
// this.state = mapStateToProps(getState());
// mapDispatchToProps = dispatch => bindActionCreators(actions, disptch)
let mapStateToProps = (state) => state.counter1;
export default connect(
  mapStateToProps,
  actions
)(Counter1)