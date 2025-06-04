import { jsxDEV } from "./react/jsx-dev-runtime.js";

const element = jsxDEV(
  "div",
  { className: "container", children: "Hello, React!" },
  undefined,
  false,
  undefined,
  this
);

console.log(element);

let element2 = (
  <h1>
    hello<span style={{ color: "red" }}>world</span>
  </h1>
);
console.log(element2);

// const element = <div className="container">Hello, React!</div>;


// const element = jsxDEV(
//   "div",
//   { className: "container", children: "Hello, React!" },
//   undefined
// );

// console.log(element)
// console.log(1)