import React from 'react';

// Counter 定义计数器组件
export default class Counter extends React.Component {
    constructor(props) {
        super(props);
        // 初始化状态
        this.state = { count: 0 };
    }

    componentWillUnmount() {
        console.log('Counter 组件卸载');
    }

    componentDidMount() { 
        console.log('Counter 组件已挂载');
    }

    increment = () => {
        this.setState({
            count: this.state.count + 1
        });
    }

    render() {
        // return React.createElement(
        //     'div',
        //     { id: 'counter' },
        //     React.createElement('p', {style: {color: 'red'}}, this.state.count),
        //     React.createElement('button', {onClick: this.increment}, '+'),
        // );
        return React.createElement(
            'div',
            { id: 'counter' },
            React.createElement('h1', null, `计数1: ${count}`),
            React.createElement(
                'button',
                { id: 'increment', style: { color: 'white', backgroundColor: 'blue' }, onClick: increment },
                '增加'
            )
        );
    }
}
/**
 * <Counter name='计数器‘ />
 * 会转换成
 * let element = React.createElement(
 *     Counter,
 *     { name: '计数器' },
 *     null
 * );
 * React.render(
 *     element,
 *     document.getElementById('root')
 * );
 */