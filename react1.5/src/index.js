import React from './react';
import ReactDOM from './react-dom';

// let jsx = <h1 className="title" style={{color:'red'}}>hello</h1>
// console.log(jsx)

let element1 = (
  <div className="title" style={{ color: "red" }}>
    <span>hello</span>world
  </div>
);
console.log(element1);
ReactDOM.render(element1, document.getElementById("root"));
// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   element1
// );