import React from './react';
import ReactDOM from './react-dom';

// import { updateQueue } from './Component';

// let jsx = <h1 className="title" style={{color:'red'}}>hello</h1>
// console.log(jsx)

// let element1 = (
//   <div className="title" style={{ color: "red" }}>
//     <span>hello</span>world
//   </div>
// );
// console.log(element1);
// ReactDOM.render(element1, document.getElementById("root"));

// // 函数组件
// function FunctionComponent(props){
//     return <div className="title" style={{ color: "red" }}> <span>{props.name}</span>{props.children}</div>
// }
// let element = <FunctionComponent name="hello">world</FunctionComponent>;

// 类组件
// class ClassComponent extends React.Component {
//     render() {
//         return <div className="title" style={{ color: "blue" }}>{this.props.name}{this.props.children}</div>;
//     }
// }
// let element = <ClassComponent name="hello">world</ClassComponent>;

// ReactDOM.render(element, document.getElementById("root"));

class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = { number: 0 };
        console.log('Counter 1.constructor')
    }

    componentWillMount() { // 取本地的数据 同步的方式：采用渲染之前获取数据，只渲染一次
        console.log('Counter 2.componentWillMount');
    }
    componentDidMount() {
        console.log('Counter 4.componentDidMount');
    }
    /**
     * event 是合成事件对象
     * 作用：
     * 1. 作为 prefill
     * 2. 处理兼容性
     *  */ 
    handleClick = (event) => {
        // updateQueue.isBatchingUpdate = true;
        // this.setState((state) => ({ number: state.number + 1 }));
        // console.log(this.state.number);
        this.setState((state) => ({ number: state.number + 1 }));
        // updateQueue.batchUpdater();
        console.log(this.state.number);
        // 阻止冒泡
        // setTimeout(() => {
        //     console.log(this.state.number);
        //     this.setState((state) => ({ number: state.number + 1 }));
        //     console.log(this.state.number);
        //     this.setState((state) => ({ number: state.number + 1 }))    ;
        //     console.log(this.state.number);
        // }, 0);
        event.stopPropagation();
    }
    handleDivClick = () => {
        console.log('handleDivClick');
    }
    // react可以shouldComponentUpdate方法中优化 PureComponent 可以帮我们做这件事
    shouldComponentUpdate(nextProps, nextState) { // 代表的是下一次的属性 和 下一次的状态
        console.log('Counter 5.shouldComponentUpdate');
        return nextState.number % 2 === 0;
        // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
    } //不要随便用setState 可能会死循环
    componentWillUpdate() {
        console.log('Counter 6.componentWillUpdate');
    }
    componentDidUpdate() {
        console.log('Counter 7.componentDidUpdate');
    }
    render() {
        console.log('Counter 3.render');
        return (
            <div onClick={this.handleDivClick}>
                <p>{this.props.title}</p>
                <p>number:{this.state.number}</p>
                <button onClick={this.handleClick}>+</button>
            </div>
        )
    }
}
ReactDOM.render(<Counter title="计数器" />, document.getElementById("root"));
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   element1
// );

let lastCounter = null;
class Sum extends React.Component {
    constructor(props) {
        super(props);
        this.a = React.createRef();
        this.b = React.createRef();
        this.result = React.createRef();
        this.counter = React.createRef();
        this.state= { number: 0 };
    }
    handleAdd = () => {
        let a = this.a.current.value;
        let b = this.b.current.value;
        this.result.current.value = a + b;
        console.log(this.counter.current);
    }
    onClick = () => {
        lastCounter = this.counter.current;
        this.setState( (state) => ({ number: state.number + 1 }), () => {
            console.log(this.counter.current, lastCounter, this.counter.current === lastCounter);
        });
    }
    render() {
        return (
            <>
                <button onClick={this.onClick}>点击触发 {this.state.number }</button>
                <Counter ref={this.counter} />
                <input ref={this.a} />+<input ref={this.b} /><button onClick={this.handleAdd}>=</button><input ref={this.result} />
            </>
        );
    }
}
// ReactDOM.render(
//     <Sum />,
//     document.getElementById('root')
// );

class TextInput extends React.Component {
    constructor(props) {
        super(props);
        this.input = React.createRef();
    }
    getFocus = () => {
        // this.input.current.focus();
    }
    getInputValue = () => {
        console.log(this.input.current.value);
        return this.input.current.value;
    }
    render() {
        return <input ref={this.input} />
    }
}

function TextInput2(props, ref) {
    return <input ref={ref} />
}
const ForwardTextInput = React.forwardRef(TextInput2);

class Form extends React.Component {
    constructor(props) {
        super(props);
        this.input = React.createRef();
        this.input2 = React.createRef();
    }
    getFocus = () => {
        console.log(this.input.current.getInputValue(), this.input2.current.value);
    }
    render() {
        return (
            <>
                <TextInput ref={this.input} /> + 
                <ForwardTextInput ref={this.input2} />
                <button onClick={this.getFocus}>获得input框的值</button>
            </>
        );
    }
}
// ReactDOM.render(
//     <Form />,
//     document.getElementById('root')
// );