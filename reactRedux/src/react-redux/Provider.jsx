import React, { Component } from 'react';
import ReactReduxContext from './ReactReduxContext';

export default function Provider(props) {
    return (
        <ReactReduxContext.Provider value={{ store: props.store }}>
            { props.children }
        </ReactReduxContext.Provider>
    )
}