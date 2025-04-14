import React from './react';


// Counter 定义计数器组件
class Counter extends React.Component {
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

    componentWillMount() {
        console.log('Counter 组件将要挂载');
    }

    increment = () => {
        this.setState({
            count: this.state.count + 1
        });
    }

    render() {
        const p = React.createElement('p', {style: {color: 'red'}}, this.props.name, this.state.count);
        const button = React.createElement('button', {onClick: this.increment}, '+')
        return React.createElement(
            'div',
            { id: 'counter' },
            p,
            // button
        );
        // return React.createElement(
        //     'div',
        //     { id: 'counter' },
        //     React.createElement('h1', null, `计数: ${count}`),
        //     React.createElement(
        //         'button',
        //         { id: 'increment', style: { color: 'white', backgroundColor: 'blue' }, onClick: increment },
        //         '增加'
        //     )
        // );
    }
}



// element 场景三： Class组件
// <Counter name='计数器‘ />
let element3 = React.createElement(Counter, { name: '计数器' });

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

const sayhello = () => {
    alert('hello world');
}

// 浏览器不能识别jsx 需要babel编译
// const element = (
//     <button id='sayhello' style={{color: 'red', backgroundColor: 'blue'}} onClick={sayhello}>
//         hello world
//         <span>hello</span>
//         <span>world</span>
//     </button>
// )

// element 场景一： 文字
// element 场景二： 标签。将 element 转成语法树、虚拟dom、 dom diff
const element2 = React.createElement('button', 
    {
        id: 'sayhello', 
        style: {
            color: 'red', 
            backgroundColor: 'blue'
        },
        onClick: sayhello
    },
    'hello',
    React.createElement('span', {}, 'hello'),
    React.createElement('span', {}, 'world')
)
// createElement 转换结果如下： 下面就是 语法树、虚拟dom、 dom diff
// element = { type: 'button', props: { id: 'sayhello', style: { color: 'red', backgroundColor: 'blue' }, onClick: [Function: sayhello] }, children: [ 'hello', { type: 'span', props: null, children: [Array] }, { type: 'span', props: null, children: [Array] } ] }
React.render(element3, document.getElementById('root'))
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//   </React.StrictMode>
// );
