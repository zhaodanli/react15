import React, { Component } from 'react'


/**
 * 用不了了，不知道为什么
 */
export default class extends Component {
    state = { loading: false }

    static getDerivedStateFromError(error) {
        // 只要捕获到 promise，立即进入 loading 态
        if (typeof error.then === 'function') {
            return { hasPromise: true, error: null };
        }
        // 捕获到真正的错误
        return { hasPromise: false, error };
    }
    /** 
     * 在 React 18 及以后，只有真正的错误（throw error）才会触发 componentDidCatch
     * throw promise 只会被 <Suspense> 处理。
     * 这是因为 React 的错误边界（componentDidCatch）只会在“commit 阶段”捕获错误，而 Suspense 的挂起（throw promise）发生在“render 阶段”，React 会在内部捕获 promise 并重新渲染父组件，但不会立即触发 componentDidCatch。只有在 promise 完成后再次渲染，才有机会触发 componentDidCatch。
     * 解决思路： 要让自定义 Suspense 能在 pending 态下立即显示 loading，必须让它在 render 阶段捕获到 throw promise，并在下次 render 时显示 fallback。
     * */
    componentDidCatch(error) {
        if (typeof error.then === 'function') {
            this.setState({ loading: true })
            error.then(() => {
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