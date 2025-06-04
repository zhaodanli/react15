import { createRoot } from "react-dom/client";

let element = (
  <h1>
    hello<span style={{ color: "red" }}>world</span>
  </h1>
);

// 创建根fiber
const root = createRoot(document.getElementById("root"));

// 构建虚拟dom
root.render(element);
