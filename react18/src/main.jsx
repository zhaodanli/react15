import * as React from "react";
import { createRoot } from "react-dom/client";


// >>>>>>>>>>>>>>>>>>>>>>. 渲染普通节点 <<<<<<<<<<<<<<<<<<<<<<<<<
// let element = (
//   <h1>
//     hello<span style={{ color: "red" }}>world</span>
//   </h1>
// );

// >>>>>>>>>>>>>>>>>>>>>>. 渲染哈拿书节点 && 合成事件 <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//   return (
//     <h1
//       onClick={() => console.log("onClick FunctionComponent")}
//       onClickCapture={() => console.log("onClickCapture FunctionComponent")}
//     >
//       hello
//       <span
//         style={{ color: "red" }}
//         onClick={() => console.log("onClick span")}
//         onClickCapture={() => console.log("onClickCapture span")}
//       >
//         world
//       </span>
//     </h1>
//   );
// }


// >>>>>>>>>>>>>>>>>>>>>>. mountReducer <<<<<<<<<<<<<<<<<<<<<<<<<
const reducer = (state, action) => {
  if (action.type === "add") {
    return state + action.payload;
  }
  return state;
};

function FunctionComponent() {
  const [number, setNumber] = React.useReducer(reducer, 0);
  return <button onClick={() => {
    setNumber({ type: "add", payload: 1})
    setNumber({ type: "add", payload: 1})
    setNumber({ type: "add", payload: 1})
  }}>{number}</button>;
}

let element = <FunctionComponent />;

// 创建根fiber
const root = createRoot(document.getElementById("root"));

// 构建虚拟dom
root.render(element);
