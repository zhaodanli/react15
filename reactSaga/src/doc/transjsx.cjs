/**
 * React使用JSX来描述用户界面
 * JSX是一种JavaScript的语法扩展
 * repl可以在线转换代码 https://babeljs.io/repl jsx 转成 语法树
 * https://astexplorer.net/ 代码 转成 语法树
 * 
 * 1. 老代码转成老的语法树
 * babeljs是一个JavaScript编译器
@babel/core是Babel编译器的核心
babylon是Babel使用的JavaScript解析器
2. 老的语法树转成新的语法树
@babel/types 用于 AST 节点的 Lodash 式工具库
3. 深度优先遍历老语法树进行代码转换
@babel/traverse用于对 AST 的遍历，维护了整棵树的状态，并且负责替换、移除和添加节点
4 新的语法树生成源代码
@babel/generator把AST转成代码
 */

// babel 核心库
let babel = require('@babel/core');
// 类型相关库，生成新节点
let types = require('@babel/types');
// 遍历语法树
let traverse = require("@babel/traverse").default;
// 从语法树生成源代码
let generate = require("@babel/generator").default;

// 将要转换的老代码
const sourceCode = `<h1 id="title" key="title" ref="title">hello</h1>`;
// 通过parse 可以把老代码转换成老语法树
// const ast = babel.parse(code);


const pluginTransformReactJsx = require('./plugin-transform-react-jsx.cjs');
// 源代码 通过 插件 转换成 目标代码
const result = babel.transform(sourceCode, {
    // plugins: [['@babel/plugin-transform-react-jsx',{runtime:'automatic'}]]
    plugins: [pluginTransformReactJsx]
});
console.log(result.code);


// let indent = 0;
// const padding = () => " ".repeat(indent);

// // 深度优先的方式遍历语法树， 把每个遍历对象传给 enter，离开时传给 exit
// traverse(ast, {
//     enter(path) {
//         console.log(padding() + path.node.type + '进入');
//         indent += 2;
//         if (types.isFunctionDeclaration(path.node)) {
//             path.node.id.name = 'newAst';
//         }
//     },
//     exit(path) {
//         indent -= 2;
//         console.log(padding() + path.node.type + '离开');
//     }
// });
// const output = generate(ast, {}, code);
// console.log(output.code);