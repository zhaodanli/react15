import React from 'react';
import App from "./src/App";

import { renderToString } from "react-dom/server";
// renderToString 是 React 官方提供的服务端渲染（SSR）API，来自 react-dom/server。

/** 这个文件是一个服务端渲染（SSR）中间件，用于 Express 服务端响应首页请求时，动态生成 HTML 内容。
 * 1. 服务端收到请求（如 /）
 * 2. 调用 render(req, res, assets)
 * 3. 用 renderToString(<App />) 把 React 组件渲染为 HTML 字符串。
 * 4. 拼接成完整的 HTML 页面（含 <div id="root">${html}</div>）。
 * 5. 返回给浏览器，首屏内容直接可见，提升首屏速度和 SEO。
 * 6. <script src="..."> 加载客户端 JS，客户端 React 代码“接管”页面，实现同构/水合。
 */
function render(req, res, assets) {
    const html = renderToString(<App />);
    // html 是 <App /> 组件渲染后的 HTML 字符串。
    res.statusCode = 200;
    res.setHeader("Content-type", "text/html;charset=utf8");
    res.send(`
     <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="${assets['main.js']}"></script>
      </body>
      </html>
  `);
}
module.exports = render;