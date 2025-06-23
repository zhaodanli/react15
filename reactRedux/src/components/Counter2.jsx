import React, { Component } from 'react';
import { bindActionCreators } from '../redux';
import actions from '../store/actions/counter2';
import store from '../store';

const boundActions = bindActionCreators(actions, store.dispatch);

export default class Counter2 extends Component {
    unsubscribe;
    constructor(props) {
        super(props);
        this.state = { number: 0 };
    }
    componentDidMount() {
        this.unsubscribe = store.subscribe(() => this.setState({ number: store.getState().counter2.number }));
    }
    componentWillUnmount() {
        this.unsubscribe();
    }
    render() {
        return (
            <div>
                <p>Counter2: {this.state.number}</p>
                <button onClick={boundActions.add2}>+</button>
                <button onClick={boundActions.minus2}>-</button>
            </div>
        )
    }
}