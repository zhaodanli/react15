import React from './react';


// Counter 定义计数器组件
class Counter extends React.Component {
    constructor(props) {
        super(props);
        // 初始化状态
        this.state = { count: 0, odd: true };
        console.log('Counter 构造函数')
    }

    componentWillUnmount() {
        // console.log('Counter componentWillUnmount');
    }

    componentDidMount() { 
        // console.log('Counter componentDidMount');
        // this.setState({
        //     count: this.state.count + 1
        // });
        // setInterval(() => {
        //     this.setState({
        //         count: this.state.count + 1
        //     });
        // }
        // , 1000);
        this.increment()
    }

    componentShouldUpdate() {
        // console.log('Counter componentShouldUpdate');
        return true;
    }

    componentWillMount() {
        // console.log('Counter componentWillMount');
    }

    componentDidUpdate() {
        // console.log('Counter componentDidUpdate');
    }

    increment = () => {
        // this.setState({
        //     count: this.state.count + 1
        // });
        this.setState({
            odd: !this.state.odd
        });
    }

    render() {
        console.log('Counter render')
        // return this.state.count;
        // const style = { color: this.state.count % 2 === 0 ? 'red' : 'blue' };   
        // const p = React.createElement('p', { style }, this.state.count);
        const button = React.createElement('button', { onClick: this.increment }, '+')
        // return React.createElement(
        //     'div',
        //     { id: 'counter', style: { backgroundColor: this.state.count % 2 === 0 ? 'blue' : 'red' }},
        //     p,
        //     button
        // );
        // return React.createElement(
        //     'div',
        //     { id: 'counter' },
        //     React.createElement('h1', {}, `计数: ${this.state.count}`),
        //     React.createElement(
        //         'button',
        //         { id: 'increment', style: { color: 'white', backgroundColor: 'blue' }, onClick: this.increment },
        //         '增加'
        //     )
        // );
        if(this.state.odd) {
            return React.createElement( 'ul', { id: 'oldCounter' },
                React.createElement('li', { key: "A"}, `A`),
                React.createElement('li', { key: "B"}, `B`),
                React.createElement('li', { key: "C"}, `C`),
                React.createElement('li', { key: "D"}, `D`),
                // button
            );
        }


        return React.createElement('ul', { id: 'newCounter' },
            React.createElement('span', { key: "A"}, `A1`),
            React.createElement('li', { key: "C"}, `C1`),
            React.createElement('li', { key: "B"}, `B1`),
            React.createElement('li', { key: "E"}, `E`),
            React.createElement('li', { key: "F"}, `F`),
            // button
        );
    }
}


class Todos extends React.Component {
    constructor(props) {
        super(props);
        this.state = { list: [], text: '' };
    }
    
    onChange = (e) => {
        this.setState({ text: e.target.value });
    }

    addTodo = () => {
        this.setState({
            list: [...this.state.list, this.state.text],
            text: ''
        });
    }

    onDelete = (index) => {
        this.setState({
            list: this.state.list.filter((_, i) => i !== index)
        });
    }

    render() {

        let input = React.createElement('input', {onKeyup: this.onChange, placeholder: '请输入待办事项', value: this.state.text});

        let button = React.createElement('button', { onClick: this.addTodo }, '添加');

        let lists = this.state.list.map((todo, index) => {
            return React.createElement('li', { key: `todo_${index}` }, 
                todo, 
                React.createElement('button', { 
                    onClick: () => this.onDelete(index)
                },
                '删除')
            );
        });
        return React.createElement('div', { id: 'todos' },
            input,
            button,
            // ...lists,
            React.createElement('ul', {}, ...lists),
        );
    }
}


// element 场景三： Class组件
// <Counter name='计数器‘ />
let element3 = React.createElement(Counter, { name: '计数器' });
let todosElement = React.createElement(Todos);

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
// React.render(element3, document.getElementById('root'))
React.render(todosElement, document.getElementById('root'))
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//   </React.StrictMode>
// );
