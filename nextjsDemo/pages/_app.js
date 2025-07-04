import App from "next/app";
import Link from "next/link";
import _appStyle from "./_app.module.css";
import "../styles/global.css";

class LayoutApp extends App {

    // 二级路由处理逻辑
    static async getInitialProps({ Component, ctx }) {
        let pageProps = {};
        if (Component.getInitialProps)
            pageProps = await Component.getInitialProps(ctx);
        return { pageProps };
    }

    render() {
        let { Component, pageProps } = this.props;
        return (
            <div>
                <style jsx>
                    {`
                        li {
                        display: inline-block;
                        margin-left: 10px;
                        line-height: 31px;
                        }
                    `}
                </style>
                <header>
                    <img src="/images/logo@2x.png" className={_appStyle.logo} />
                    <ul>
                        <li><Link href="/">首页</Link></li>
                        <li><Link href="/user">用户管理</Link></li>
                        <li><Link href="/profile">个人中心</Link></li>
                    </ul>
                </header>
                <Component {...pageProps} />
                <footer style={{ textAlign: "center" }}>@copyright 珠峰架构</footer>
            </div>
        );
    }
}
export default LayoutApp;