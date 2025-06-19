// 导入React
import React from "react";
// 从react-router中导入Router组件
import { Router, useNavigate, useLocation } from "../react-router";
// 从history库中导入createHashHistory和createBrowserHistory函数, 结果一样， 但是原理不一样
import { createHashHistory, createBrowserHistory } from "../history";
// 导出react-router中的所有内容

/** 这段代码定义了两个 React 组件：HashRouter和BrowserRouter。
 * 这两个组件都利用react-router和history库来创建和管理路由。
 * HashRouter使用 URL 的哈希部分来处理路由，而BrowserRouter使用 HTML5 的历史 API。
 * 两者都通过监听历史对象的变化来更新路由状态，并将更新的状态传递给Router组件以实现路由导航。
 * 这种方式为 React 应用程序提供了灵活的路由管理能力。
 * 这个库以来react-router 路由核心库，跨平台，浏览器，客户端，服务器端，reacteAPP里面， web,DOM里都可以
 * reacte-dom 是dom 相关的库， 区分关系分为是否依赖平台
 * @param {*} param0 
 * @returns 
 */
// 定义一个HashRouter函数组件，接收children作为props
export function HashRouter({ children }) {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 创建对象 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 使用useRef创建一个可变的ref对象，用于存储历史对象的引用
    let historyRef = React.useRef();
    // 如果historyRef的current属性为null，表示尚未创建历史对象
    if (historyRef.current == null) {
        // 创建一个哈希历史对象并赋值给historyRef的current属性
        historyRef.current = createHashHistory();
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 保存当前对象 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 获取当前的历史对象
    let history = historyRef.current;
    // 使用useState创建一个状态，存储当前的动作和位置
    let [state, setState] = React.useState({
        action: history.action,
        location: history.location,
    });

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 对象操作 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    //使用useLayoutEffect在历史对象发生变化时更新状态  
    // 监听路径改变，路径改变会执行setState，进行二次渲染
    React.useLayoutEffect(() => history.listen(setState), [history]);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 渲染 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 渲染Router组件，并传递children、位置、导航类型和历史对象
    return (
        <Router
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    );
}

// 定义一个BrowserRouter函数组件，接收children作为props
export function BrowserRouter({ children }) {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 创建对象 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 使用useRef创建一个可变的ref对象，用于存储历史对象的引用
    let historyRef = React.useRef();
    // 如果historyRef的current属性为null，表示尚未创建历史对象
    if (historyRef.current == null) {
        // 创建一个浏览器历史对象并赋值给historyRef的current属性
        historyRef.current = createBrowserHistory();
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 保存当前对象 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 获取当前的历史对象
    let history = historyRef.current;
    // 使用useState创建一个状态，存储当前的动作和位置
    let [state, setState] = React.useState({
        action: history.action,
        location: history.location,
    });

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 对象操作 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 使用useLayoutEffect在历史对象发生变化时更新状态
    // setState的参数是新的location(非window.loacation)({ action, location })
    React.useLayoutEffect(() => history.listen(setState), [history]);

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 渲染 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    //渲染Router组件，并传递children、位置、导航类型和历史对象
    return (
        <Router
            children={children}
            location={state.location}
            navigationType={state.action}
            navigator={history}
        />
    );
}

export function Link({ to, children, ...options }) {
    const navigate = useNavigate();
    return (
        <a {...options} href={to} onClick={(event) => {
            event.preventDefault();
            navigate(to, options);
        }} >{children}</a>
    )
}


/** NavLink 可以配置额外样式
 * end end = true 不匹配前缀之匹配路径
 * 接收 isActive，传递 className 和 style
 */
export function NavLink({ 
    className: classNameProp = '', 
    end = false, 
    style: styleProp = {}, 
    to, 
    children, 
    ...rest 
}) {
    // 获取路径名
    let location = useLocation();
    let locationPathname = location.pathname;

    // 获取跳转路径
    let path = { pathname: to };
    let toPathname = path.pathname;

    // 判断匹配度 当前路径和此导航要去的链接
    // 1. 完全相等 2. end = false（不需要完整的匹配，只需要匹配前缀） 并且以 AAA开头 /user 和 /user/list  = ture
    // 只有当 /user 后面紧跟 / /user/list.charAt(5) → /（因为 /user 长度是 5，第 6 个字符是 /）
    let isActive = locationPathname === toPathname
        || (!end && locationPathname.startsWith(toPathname) && locationPathname.charAt(toPathname.length) === '/')

    // 属性处理
    let className;
    if (typeof classNameProp === 'function') {
        className = classNameProp({
            isActive
        });
    }
    let style;
    if (typeof styleProp === 'function') {
        style = styleProp({
            isActive
        });
    }
    return (
        <Link {...rest} to={to} className={className} style={style}>{children}</Link>
    )
}