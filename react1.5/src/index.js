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
    }
    /**
     * event 是合成事件对象
     * 作用：
     * 1. 作为 prefill
     * 2. 处理兼容性
     *  */ 
    handleClick = (event) => {
        // updateQueue.isBatchingUpdate = true;
        this.setState((state) => ({ number: state.number + 1 }));
        console.log(this.state.number);
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
    render() {
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