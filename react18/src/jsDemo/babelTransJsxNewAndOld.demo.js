/**
 * 模拟新旧babel 转义结果
 * 转义 runtime 不同
 * 转义结果不同
 */

/**
 * 旧babel 转义 runtime: "classic"
 */
const babel = require("@babel/core");
const sourceCode = `
<h1>
    hello<span style={{ color: "red" }}>world</span>
</h1>
`;
const result = babel.transform(sourceCode, {
  plugins: [["@babel/plugin-transform-react-jsx", { runtime: "classic" }]],
});
console.log(result.code);

/**
 * 新 automatic
 */
const sourceCodeNew = `
<h1>
    hello<span style={{ color: "red" }}>world</span>
</h1>
`;
const resultNew = babel.transform(sourceCodeNew, {
    plugins: [["@babel/plugin-transform-react-jsx", { runtime: "automatic" }]],
});
console.log(resultNew.code);