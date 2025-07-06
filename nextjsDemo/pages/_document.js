import Document, { Html, Head, Main, NextScript } from 'next/document';


/**
 * 在 Next.js 中，_document.js 是一个自定义文档文件，它允许你修改应用的 HTML 文档的结构。它主要用于配置一些全局的 HTML 元素，比如 <html>、<head> 和 <body> 标签。使用 _document.js 你可以更改服务器端渲染时生成的 HTML 文档的输出，而不必影响每个页面的组件。

主要作用和用法：
自定义文档结构：
_document.js 允许你修改默认的文档结构。如果你需要设置一些全局的 meta 标签、链接、样式或脚本，可以在这个文件中进行。

Head 标签：
你可以在 <Head> 组件中添加全局需要的 <meta> 标签，比如设置字符集、视口配置、优先加载的 CSS 和 JS 文件等等。

全局样式：
如果你的应用需要全局样式（例如引入外部 CSS 文件），可以在 _document.js 中引入它们。

自定义 <body> 和 <html> 属性：
你可以为 <html> 和 <body> 标签添加自定义属性，比如 lang 属性，或者为 <body> 标签添加类名。
 */
class CustomDocument extends Document {
    static async getInitialProps(ctx) {
        const props = await Document.getInitialProps(ctx);
        return { ...props };
    }
    render() {
        return (
            <Html lang="en">  {/* 设置 lang 属性 */}
                <Head>
                    <meta charSet="utf-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    {/* <link rel="stylesheet" href="https://example.com/some-global-styles.css" /> 引入全局样式 */}
                    <style>
                        {
                            `
                            *{
                                padding:0;
                                margin:0;
                            }
                            `
                        }
                    </style>
                </Head>
                <body>
                    <Main /> {/* 这是 Next.js 渲染页面的地方 */}
                    <NextScript /> {/* 这是 Next.js 渲染的脚本 */}
                </body>
            </Html>
        )
    }
}
export default CustomDocument;