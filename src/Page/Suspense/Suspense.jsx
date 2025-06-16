import React, { Component } from 'react'


/**
 * 用不了了，不知道为什么
 */
export default class extends Component {
    state = { loading: false }

    /** 
     * 在 React 18+，自定义 ErrorBoundary（componentDidCatch）无法捕获 throw promise，只能捕获 throw error。
你想“模拟” Suspense 行为，让 componentDidCatch 能拿到 promise 并处理 loading，但 throw new Error(promise) 其实会把 promise 转成字符串，无法还原原始 promise。
     * */
    componentDidCatch(error) {
        if (error && error.isPromise && typeof error.promise?.then === 'function') {
            this.setState({ loading: true })
            Promise.resolve(error.message).then(() => {
                this.setState({ loading: false })
            })
        }
    }

    render() {
        const { children, fallback } = this.props;
        const { loading } = this.state;

        return loading ? fallback : children;
    }
}