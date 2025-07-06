import App from "next/app";
import Link from "next/link";
import _appStyle from "./_app.module.css";
import "../styles/global.css";
import { Provider } from 'react-redux';
import request from '@/utils/request';
import createStore from '../store';
import * as types from '../store/action-types';

function getStore(initialState) {
    if (typeof window === 'undefined') {
        return createStore(initialState); // 如果是服务器端,每次都返回新的仓库
    } else {
        if (!window._REDUX_STORE_) {
            window._REDUX_STORE_ = createStore(initialState);
        }
        return window._REDUX_STORE_;
    }
}

class LayoutApp extends App {
    constructor(props) {
        super(props)
        this.store = getStore(props.initialState);
        console.log('LayoutApp constructor');
    }

    // 二级路由处理逻辑
    static async getInitialProps({ Component, ctx }) {
        console.log('LayoutApp getInitialProps');

        //  ================= 仓库处理 =============
        let store = getStore(); // 1.后台创建新仓库  5.每次切换路由都会执行此方法获取老仓库

        if (typeof window == 'undefined') { // 2.后台获取用户信息
            let options = { url: '/api/validate' };
            if (ctx.req && ctx.req.headers.cookie) {
                options.headers = options.headers || {};
                options.headers.cookie = ctx.req.headers.cookie;
            }

            // 校验规则
            let response = await request(options).then(res => res.data);
            if (response.success) {
                store.dispatch({ type: types.SET_USER_INFO, payload: response.data });
            }
        }
        let pageProps = {};

        // 获取组件的初始属性
        if (Component.getInitialProps)
            pageProps = await Component.getInitialProps(ctx);
        return { pageProps };
    }

    render() {
        console.log('LayoutApp render');
        let state = this.store.getState();
        let { Component, pageProps } = this.props;
        return (
            <Provider store={this.store}>
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
                        <li><Link href="/user/list">用户管理</Link></li>
                        <li><Link href="/profile">个人中心</Link></li>
                        <li>
                        {
                            state.currentUser ? <span>{state.currentUser.name}</span> : <Link href="/login">登录</Link>
                        }
                        </li>
                    </ul>
                </header>
                <Component {...pageProps} />
            </Provider>
        );
    }
}
export default LayoutApp;