import { REACT_ELEMENT } from "./constants";
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

const React = {
    createElement,
    Component
}
export default React