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
// const reducer = (state, action) => {
//   if (action.type === "add") {
//     return state + action.payload;
//   }
//   return state;
// };

// function FunctionComponent() {
//   const [number, setNumber] = React.useReducer(reducer, 0);
//   const [number2, setNumber2] = React.useState(0);

//   return (
//     <div>
//       {/* 多节点渲染 */}
//       {/* <button onClick={() => setNumber2(number2 + 1)}>number2: {number2}</button> */}
//       {/* 单节点渲染 */}
//       <button onClick={() => {
//         setNumber({ type: "add", payload: 1 })
//         setNumber({ type: "add", payload: 2 })
//         setNumber({ type: "add", payload: 3 })
//       }}>{number}</button>
//     </div>
//   )
// }

// >>>>>>>>>>>>>>>>>>>>>>. mount useState <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//   const [number2, setNumber2] = React.useState(0);

//   return (
//     <button onClick={() => {
//       setNumber2(number2);
//       setNumber2(number2 + 1);
//       setNumber2(number2 + 2);
//     }}>{number2}</button>
//   )
// }


// >>>>>>>>>>>>>>>>>>>>>> 1. 单节点(key 相同,类型相同)  <<<<<<<<<<<<<<<<<<<<<<<<<
/**   reconcileSingleElement    */
// const reducer = (state, action) => {
//   if (action.type === "add") {
//     return state + action.payload;
//   }
//   return state;
// };

// function FunctionComponent() {
//   const [number, setNumber] = React.useReducer(reducer, 0);

//   return number%2 === 0 ? (
//     <div onClick={() => setNumber({ type: "add", payload: 1 })} key="title" id="title">title</div>
//   ): (
//     <div onClick={() => setNumber({ type: "add", payload: 1 })} key="title" id="title2">title2</div>
//   )
// }


// >>>>>>>>>>>>>>>>>>>>>> 2. 单节点(key 相同,类型不相同) 1 <<<<<<<<<<<<<<<<<<<<<<<<<
/**   reconcileSingleElement    */
// function FunctionComponent() {
//   const [number, setNumber] = React.useState(0);

//   return number%2 === 0 ? (
//     <div onClick={() => setNumber(number + 1)} key="title" id="title">title</div>
//   ): (
//     <p onClick={() => setNumber(number + 1)} key="title" id="title2">title2</p>
//   )
// }

// >>>>>>>>>>>>>>>>>>>>>> 3. 单节点(key 不相同,类型相同) 1 <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//   const [number, setNumber] = React.useState(0);

//   return number%2 === 0 ? (
//     <div onClick={() => setNumber(number + 1)} key="title" id="title">title</div>
//   ): (
//     <div onClick={() => setNumber(number + 1)} key="title2" id="title2">title2</div>
//   )
// }

// >>>>>>>>>>>>>>>>>>>>>> 4. 单节点(key 不相同,类型不相同)  <<<<<<<<<<<<<<<<<<<<<<<<<
function FunctionComponent() {
  const [number, setNumber] = React.useState(0);

  return number%2 === 0 ? (
    <div onClick={() => setNumber(number + 1)} key="title" id="title">title</div>
  ): (
    <p onClick={() => setNumber(number + 1)} key="title2" id="title2">title2</p>
  )
}

// >>>>>>>>>>>>>>>>>>>>>> 多节点 DIFF  <<<<<<<<<<<<<<<<<<<<<<<<<
// const reducer = (state, action) => {
//   if (action.type === "add") {
//     return state + action.payload;
//   }
//   return state;
// };

// function FunctionComponent() {
//   const [number, setNumber] = React.useReducer(reducer, 0);

//   return number === 0 ? (
//     <ul key="container" onClick={() => setNumber(number 1)}>
//       <li key="A">A</li>
//       <li key="B" id="B">
//         B
//       </li>
//       <li key="C" id="C">
//         C
//       </li>
//     </ul>
//   ) : (
//     <ul key="container" onClick={() => setNumber(number 1)}>
//       <li key="A">A2</li>
//       <p key="B" id="B2">
//         B2
//       </p>
//       <li key="C" id="C2">
//         C2
//       </li>
//     </ul>
//   );
// }

// >>>>>>>>>>>>>>>>>>>>>>. mountReducer <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent2() {
//   const [number, setNumber] = React.useReducer(reducer, 0);
//   return number === 0 ? (
//     <div onClick={() => setNumber({ type: "add", payload: 1})} key="title" id="title">
//       title
//       <button onClick={() => {
//         setNumber({ type: "add", payload: 1})
//         setNumber({ type: "add", payload: 2})
//         setNumber({ type: "add", payload: 3})
//       }}>{number}</button>
//     </div>
//   ) : (
//     <div onClick={() => setNumber({ type: "add", payload: 1})}  key="title" id="title2">
//       title2
//     </div>
//   );
// }



let element = <FunctionComponent />;

// 创建根fiber
const root = createRoot(document.getElementById("root"));

// 构建虚拟dom
root.render(element);