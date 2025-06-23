import React from 'react';
import { Router } from 'react-router';

/** 应用场景
SSR、持久化、redux 路由同步等需要自定义 history 的场景。
结合 redux-first-history，可以让 redux 和路由状态完全同步，支持用 action 控制路由跳转。
 */
// 允许你传入自定义的 history（如 redux-first-history 生成的 reduxHistory），而不是只能用默认的 BrowserRouter/HashRouter。
export function HistoryRouter({ history, children }) {
    // 1. 用 state 保存当前的 action 和 location
    const [state, setState] = React.useState({
        action: history.action,
        location: history.location
    });

    // 2. 监听 history 变化，变化时 setState，驱动 Router 更新
    React.useLayoutEffect(() => {
        history.listen(setState);
    }, [history]);
    
    // 3. 渲染 Router，传递最新的 location、action、navigator
    return (
        <Router
            location={state.location}
            action={state.action}
            navigator={history}
            navigationType={state.action}
        >
            {children}
        </Router>
    )

}