const types = require('@babel/types');
const pluginSyntaxJsx = require('@babel/plugin-syntax-jsx').default;

// 继承 pluginSyntaxJsx 才能做转换
const pluginTransformReactJsx = {
    inherits: pluginSyntaxJsx,
    // 
    visitor: {
        // AST 语法树类型名
        //  bebel遍历语法树，发现当前遍历节点类型一样，会传过来
        JSXElement(path) {
            let callExpression = buildJSXElementCall(path);
            // 新节点替换老节点
            path.replaceWith(callExpression);
        }
    }
}

function buildJSXElementCall(path) {
    const args = [];
    return call(path, "jsx", args);
}

function call(path, name, args) {
    // 创建 jsx 标识符节点
    const callee = types.identifier('_jsx');
    // 创建
    const node = types.callExpression(callee, args);
    return node;
}
module.exports = pluginTransformReactJsx;