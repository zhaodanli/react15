import React from 'react';
import App from "./src/App";

import { renderToString, renderToPipeableStream } from "react-dom/server";
// renderToString 是 React 官方提供的服务端渲染（SSR）API，来自 react-dom/server。

/** 这个文件是一个服务端渲染（SSR）中间件，用于 Express 服务端响应首页请求时，动态生成 HTML 内容。
 * react 18 之前
 * 1. 服务端收到请求（如 /）
 * 2. 调用 render(req, res, assets)
 * 3. 用 renderToString(<App />) 把 React 组件渲染为 HTML 字符串。
 * 4. 拼接成完整的 HTML 页面（含 <div id="root">${html}</div>）。
 * 5. 返回给浏览器，首屏内容直接可见，提升首屏速度和 SEO。
 * 6. <script src="..."> 加载客户端 JS，客户端 React 代码“接管”页面，实现同构/水合。
 */
// function render(req, res, assets) {
//     const html = renderToString(<App />);
//     // html 是 <App /> 组件渲染后的 HTML 字符串。
//     res.statusCode = 200;
//     res.setHeader("Content-type", "text/html;charset=utf8");
//     res.send(`
//      <!DOCTYPE html>
//       <html lang="en">
//       <head>
//         <meta charset="UTF-8">
//         <meta http-equiv="X-UA-Compatible" content="IE=edge">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Document</title>
//       </head>
//       <body>
//         <div id="root">${html}</div>
//         <script src="${assets['main.js']}"></script>
//       </body>
//       </html>
//   `);
// }


/** react18 之后
 * 流式渲染：相比老的 renderToString，可以更快地把首屏内容推送给浏览器，提升首屏速度和用户体验。
 * 支持 Suspense：可以边加载数据边渲染，支持 React 18 的 Suspense for Data Fetching。
 * SEO 友好：首屏 HTML 直接返回，利于搜索引擎收录。
 * 
    // renderToPipeableStream 是 React 18 新增的服务端渲染 API。
    // 它会把 <App /> 组件渲染为一个“可流式输出”的 HTML 片段。

    // bootstrapScripts 指定客户端需要加载的 JS 文件（即打包产物 main.js），用于客户端“水合”React应用。
    
    // 钩子函数，当 React 的“外壳”HTML（即不依赖数据的部分）准备好时触发。
    // 先写入 HTML 头部和 <div id="root">。
    // pipe(res) 会把 React 渲染的内容流式写入 <div id="root"> 内。
    // 最后写入 HTML 尾部，完成整个页面。
    
    // pipe APP内容 返回值中的 pipe 方法可以把 HTML 内容流式写入响应（res）。
 */
function render(req, res, assets) {
    const { pipe, abort } = renderToPipeableStream(
        <App />,
        {
            bootstrapScripts: [assets['main.js']],
            onShellReady() {
                res.statusCode = 200;
                res.setHeader("Content-type", "text/html;charset=utf8");
                res.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><div id="root">`);
                pipe(res);
                res.write(`</div></body></html>`)
            },
            onError(error) {
                console.error('渲染错误:', error);
                abort();
            }
        }
    );
}
module.exports = render;