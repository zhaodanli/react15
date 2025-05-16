import { REACT_ELEMENT, REACT_FORWARD_REF_TYPE, REACT_FRAGMENT, REACT_PROVIDER, REACT_CONTEXT } from "./constants";
import { toVdom } from "./utils";
import { Component } from './Component';

function createElement(type, config, children) {
    let ref;
    let key;
    if (config) {
        delete config.__source;
        delete config.__self;
        ref = config.ref;
        delete config.ref;
        key = config.key;
        delete config.key;
    }
    let props = { ...config };
    if (arguments.length > 3) {
        props.children = Array.prototype.slice.call(arguments, 2).map(toVdom);
    }else {
        props.children = toVdom(children);
    }
    return {
        $$typeof: REACT_ELEMENT,
        type,
        ref,
        key,
        props,
    };
}

function createRef() {
    return {
        current: null
    }
}

function forwardRef(render) {  
    var elementType = {
        $$typeof: REACT_FORWARD_REF_TYPE,
        render: render
    };
    return elementType;
}

function createContext() {
    let context = {
        $$typeof: REACT_CONTEXT, 
        _currentValue: undefined 
    };
    context.Provider = {
        $$typeof: REACT_PROVIDER,
        _context: context,
        _currentValue: undefined 
    }
    context.Consumer = {
        $$typeof: REACT_CONTEXT,
        _context: context,
        _currentValue: undefined 
    };
    return context; 
    // {
    //     $$typeof: REACT_CONTEXT, 
    //     _currentValue: undefined 
    //     Provider: {
    //         $$typeof: REACT_PROVIDER,
    //         _context: context,
    //         _currentValue: undefined 
    //     },
    //     Consumer: {
    //         $$typeof: REACT_CONTEXT,
    //         _context: context,
    //         _currentValue: undefined 
    //     };
    // }
}

function cloneElement(element, newProps, ...newChildren) {
    let oldChildren = element.props && element.props.children;
    let children = [...(Array.isArray(oldChildren) ? oldChildren : [oldChildren]), ...newChildren]
      .filter(item => item !== undefined)
      .map(toVdom);
    if (children.length === 1) children = children[0];
    let props = { ...element.props, ...newProps, children };
    return { ...element, props }; 
}

const React = {
    createElement,
    Component,
    createRef,
    forwardRef,
    Fragment: REACT_FRAGMENT,
    createContext,
    cloneElement,
}
export default React