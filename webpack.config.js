/**
 * webback 核心配置文件
 * 客户端渲染改造同构 webpack5 + reacteroute6 + react18
 * 适用于 React 18 + React Router 6 的开发环境。
 * 适合“客户端渲染”或“同构渲染”项目的前端部分打包。
 * 若要支持同构（SSR），还需额外配置 server 端入口和 target
 */

const path = require('path');
module.exports = {
    mode: 'development', // 指定为开发模式
    devtool: false, // 关闭 source map（不生成调试用的映射文件）
    entry: './src/main.js', // 指定打包入口文件。
    output: { // 指定打包输出目录和文件名（build/main.js）。
        path: path.resolve(__dirname, './build'), // 指定打包输出目录和文件名（build/main.js）。
        filename: 'main.js'
    },
    watch: true, // 启用自动监听文件变化，自动重新打包。
    module: {
        rules: [
            { // 对所有 .js 文件，优先用 source-map-loader 处理（用于解析已有的 source map）。
                test: /\.js$/,
                enforce: 'pre',
                use: {
                    loader: 'source-map-loader',
                }
            },
            { // 对所有 .js 文件（排除 node_modules），用 babel-loader 转译，支持 React JSX 语法（通过 @babel/preset-react）。
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ["@babel/preset-react"]
                    }
                },
                exclude: /node_modules/
            },
        ],
    },
}