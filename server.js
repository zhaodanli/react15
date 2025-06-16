/** 通过代码调用webpackAPI打包
 * 用于 React SSR（同构渲染）开发环境的 Node 服务端启动脚本
 * 主要功能是：打包前端代码、生成资源清单、、并用 Express 启动服务，处理首页请求（首页 SSR）和静态资源（静态资源托管一体化）。
 * 1. 打包
 * 2. 构建HTML
 * 
 */

/** Babel 注册
 * 让 Node.js 运行时支持直接 require JSX/ES6+ 语法的 React 代码（无需预先编译）。
 * 只处理非 node_modules 目录下的文件。
 * 解决 js不能使用 export问题
 * @babel/register在底层改写了 node 的 require 办法，在代码里引入 @babel/register模块后，所有通过require引入并且以.es6、.es、.jsx、.mjs和.js为后缀名的模块都会被 Babel 转译
 * @babel/plugin-transform-modules-commonjs 转换ES模块为CommonJS
 * */
const babelRegister = require('@babel/register');
babelRegister({
    ignore: [/node_modules/],
    presets: ["@babel/preset-react"],
    plugins: ['@babel/plugin-transform-modules-commonjs'],
});

/** 依赖引入
 * 引入 webpack 用于打包前端资源。
 * 引入 express 用于启动 HTTP 服务。
 * 引入 serve-static 用于托管静态文件（如打包后的 JS）。
 * 加载 webpack 配置和自定义的 render 函数。
 */
const webpack = require('webpack');
const express = require('express');
const static = require('serve-static');

// cross-env 设置环境变量（跨平台，map 和 window不一样， nodemon 启动脚本， 监控变化重启服务器）
const webpackConfig = require('./webpack.config');
const render = require('./render');

/** Webpack 打包并启动服务
 * 用 webpack 进行一次打包，回调中拿到打包结果。
 */
webpack(webpackConfig, (err, stats) => {
    let statsJSON = stats.toJson({ assets: true });
    // 解析打包产物，生成资源清单（assets），如 { 'main.js': '/main.js' }。
    const assets = statsJSON.assets.reduce((memo, { name }) => {
        memo[name] = `/${name}`
        return memo;
    }, {});

    // 创建 express 实例，注册路由：
    const app = express();
    // / 路由：调用 render(req, res, assets) 进行服务端渲染（SSR），返回 HTML。
    app.get('/', async function (req, res) {
        render(req, res, assets);
    });
    // 静态资源路由：app.use(static('build'))，托管 build 目录下的静态文件（如 main.js）。
    app.use(static('build'));
    // 启动服务，监听 8080 端口。
    // app.listen(8080, () => console.log('server started on port 8080'));
    app.listen(8080, '127.0.0.1', () => {
        console.log('server started at port 8080');
    });
});