import React from './react';
import ReactDOM from './react-dom';

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
class ClassComponent extends React.Component {
    render() {
        return <div className="title" style={{ color: "blue" }}>{this.props.name}{this.props.children}</div>;
    }
}
let element = <ClassComponent name="hello">world</ClassComponent>;

ReactDOM.render(element, document.getElementById("root"));
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   element1
// );