import $ from 'jquery';
import Component from './Component.jsx';
import { createComponent, createElement } from './createComponent.js';

const React = {
    render,
    rootIndex: 0
}
function render(element, container) {
    // 渲染成 HTML 字符串
    const component = createComponent(element);
    // 返回 html 标记
    let markUp = component.getHtmlString(React.rootIndex);
    $(container).html(markUp);
    $(document).trigger('mounted');
}


export default { 
    render,
    createComponent,
    createElement,
    Component,
};