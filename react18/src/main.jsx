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
// function FunctionComponent() {
//   const [number, setNumber] = React.useState(0);

//   return number%2 === 0 ? (
//     <div onClick={() => setNumber(number + 1)} key="title" id="title">title</div>
//   ): (
//     <p onClick={() => setNumber(number + 1)} key="title2" id="title2">title2</p>
//   )
// }

// >>>>>>>>>>>>>>>>>>>>>> 原来多个节点，现在只有一个节点F  <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B">
//                 B
//             </li>
//             <li key="C">C</li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="B" id="B2">
//                 B2
//             </li>
//         </ul>
//     );
// }

/** >>>>>>>>>>>>>>>>>>>>>>> 以上是单节点diff <<<<<<<<<<<<<<<<<<<<<<<<<<< */

// >>>>>>>>>>>>>>>>>>>>>> 多节点 DIFF  <<<<<<<<<<<<<<<<<<<<<<<<<

// function FunctionComponent() {
//     console.log("FunctionComponent");
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B">
//                 B
//             </li>
//             <li key="C" id="C">
//                 C
//             </li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A2</li>
//             <p key="B" id="B2">
//                 B2
//             </p>
//             <li key="C" id="C2">
//                 C2
//             </li>
//         </ul>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> 多个节点的数量和 key 相同，有的 type 不同  <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     console.log("FunctionComponent");
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B">
//                 B
//             </li>
//             <li key="C" id="C">
//                 C
//             </li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A2</li>
//             <p key="B" id="B2">
//                 B2
//             </p>
//             <li key="C" id="C2">
//                 C2
//             </li>
//         </ul>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> 多个节点的类型和 key 全部相同，有新增元素 <<<<<<<<<<<<<<<<<<<<<<<<<

// function FunctionComponent() {
//     console.log("FunctionComponent");
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B">
//                 B
//             </li>
//             <li key="C">C</li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B2">
//                 B2
//             </li>
//             <li key="C">C2</li>
//             <li key="D">D</li>
//         </ul>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> 多个节点的类型和 key 全部相同，有删除老元素 <<<<<<<<<<<<<<<<<<<<<<<<<

// function FunctionComponent() {
//     console.log("FunctionComponent");
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B">
//                 B
//             </li>
//             <li key="C">C</li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="B2">
//                 B2
//             </li>
//         </ul>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> 多个节点数量不同、key 不同 <<<<<<<<<<<<<<<<<<<<<<<<<

// function FunctionComponent() {
//     console.log("FunctionComponent");
//     const [number, setNumber] = React.useState(0);
//     return number === 0 ? (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A</li>
//             <li key="B" id="b">
//                 B
//             </li>
//             <li key="C">C</li>
//             <li key="D">D</li>
//             <li key="E">E</li>
//             <li key="F">F</li>
//         </ul>
//     ) : (
//         <ul key="container" onClick={() => setNumber(number + 1)}>
//             <li key="A">A2</li>
//             <li key="C">C2</li>
//             <li key="E">E2</li>
//             <li key="B" id="b2">
//                 B2
//             </li>
//             <li key="G">G</li>
//             <li key="D">D2</li>
//         </ul>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> useEffect <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     const [number, setNumber] = React.useState(0);
//     React.useEffect(() => {
//         console.log("useEffect1");
//         return () => {
//             console.log("destroy useEffect1");
//         };
//     }, [1]);
//     React.useEffect(() => {
//         console.log("useEffect2");
//         return () => {
//             console.log("destroy useEffect2");
//         };
//     });
//     React.useEffect(() => {
//         console.log("useEffect3");
//         return () => {
//             console.log("destroy useEffect3");
//         };
//     });
//     return (
//         <div
//             onClick={() => {
//                 setNumber(number + 1);
//             }}
//         >
//             {number}
//         </div>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> useLayoutEffect <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     const [number, setNumber] = React.useState(0);
//     React.useEffect(() => {
//         console.log("useEffect1");
//         return () => {
//             console.log("destroy useEffect1");
//         };
//     });
//     React.useLayoutEffect(() => {
//         console.log("useLayoutEffect1");
//         return () => {
//             console.log("destroy useLayoutEffect1");
//         };
//     });
//     return (
//         <div
//             onClick={() => {
//                 setNumber(number + 1);
//             }}
//         >
//             {number}
//         </div>
//     );
// }

// >>>>>>>>>>>>>>>>>>>>>> 初次渲染 <<<<<<<<<<<<<<<<<<<<<<<<<
// let element = <h1>hello</h1>;

// >>>>>>>>>>>>>>>>>>>>>> 更新渲染 <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     const [number, setNumber] = React.useState(0);
//     return <button onClick={() => {
//         setNumber(number + 1)
//     }}>{number}</button>
// }

// >>>>>>>>>>>>>>>>>>>>>> 并发渲染 <<<<<<<<<<<<<<<<<<<<<<<<<
function FunctionComponent() {
    console.log('FunctionComponent');
    const [number, setNumber] = React.useState(0);

    // useEffect 里的 setState 是“异步批量”调度 performConcurrentWorkOnRoot
    React.useEffect(() => {
        debugger
        setNumber(number => number + 1)
    }, [])

    // 点击（click）事件属于 DiscreteEventPriority（离散事件优先级）。
    // 在 ReactFiberLane.js 里，DiscreteEventPriority 会被映射为 SyncLane（同步车道）。
    return (<button onClick={() => setNumber(number + 1)}>{number}</button>)
}

// >>>>>>>>>>>>>>>>>>>>>> 批量更新 <<<<<<<<<<<<<<<<<<<<<<<<<
// function FunctionComponent() {
//     console.log('FunctionComponent');
//     const [number, setNumber] = React.useState(0);
//     React.useEffect(() => {
//         setNumber(number => number + 1)
//         setNumber(number => number + 1)
//     }, []);
//     return (<button onClick={() => {
//         setNumber(number => number + 1)
//         setNumber(number => number + 1)
//     }}>{number}</button>)
// }

let element = <FunctionComponent />;

// 创建根fiber
const root = createRoot(document.getElementById("root"));

// 构建虚拟dom
root.render(element);