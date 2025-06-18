// 导入React库
import React from "react";
// 创建导航上下文
const NavigationContext = React.createContext({});
// 创建位置上下文
const LocationContext = React.createContext({});
// 导出上下文
export { NavigationContext, LocationContext };

/**
 * 这段代码是一个React路由管理工具的实现，包括创建上下文（NavigationContext和LocationContext），定义路由器（Router）和路由（Routes，Route），以及一些自定义钩子（useLocation, useSearchParams, useRoutes）用于管理路由状态和解析URL参数。核心功能是根据React的子组件定义动态路由，以及提供路径匹配功能。代码风格注重模块化和可复用性，适合用于构建复杂的单页应用程序。
 * @param {*} param0 
 * @returns 
 */
// 定义Router函数组件
export function Router({ children, location, navigator }) {
    // 使用useMemo钩子创建导航上下文对象 navigator ->> navigationContext
    const navigationContext = React.useMemo(() => ({ navigator }), [navigator]);
    // 使用useMemo钩子创建位置上下文对象
    const locationContext = React.useMemo(() => ({ location }), [location]);
    // 返回Router组件结构
    return (
        <NavigationContext.Provider value={navigationContext}>
            <LocationContext.Provider value={locationContext} children={children} />
        </NavigationContext.Provider>
    );
}

// 定义Routes函数组件 根据子元素创建路由配置数组
export function Routes({ children }) {
    // 使用useRoutes钩子创建路由,获取路由规则获取到的数组
    return useRoutes(createRoutesFromChildren(children));
}

// 从子元素创建路由数组
export function createRoutesFromChildren(children) {
    let routes = [];
    // 遍历子元素创建路由对象
    // React.Children.forEach 是React提供的工具方法， 帮助遍历子元素，是null undefined，函数类等等，避免了很多判断。同时兼容单子元素或者子元素数组 
    React.Children.forEach(children, (element) => {
        // 根据子元素创建route 对象
        let route = {
            path: element.props.path,
            element: element.props.element,
        };
        routes.push(route);
    });
    return routes;
}

// 定义useRoutes钩子 接收定义好的数组 routes， 拿当前 loacation 和数组匹配
export function useRoutes(routes) {
    // 获取当前位置
    let location = useLocation();
    let pathname = location.pathname || "/";
    // 遍历路由数组匹配当前路径
    for (let i = 0; i < routes.length; i++) {
        let { path, element } = routes[i];
        // 路由惠泽中的路径和当前浏览器的路径匹配，对一个匹配的
        let match = matchPath(path, pathname);
        if (match) {
            // 返回并渲染
            return element;
        }
    }
    return null;
}

// 定义useLocation钩子
export function useLocation() {
    // 返回当前位置上下文的位置信息
    return React.useContext(LocationContext).location;
}
// 定义useSearchParams钩子
export function useSearchParams() {
    // 从位置上下文中获取当前位置
    const location = React.useContext(LocationContext).location;
    const pathname = location.pathname;
    // 返回当前URL的查询参数
    return new URLSearchParams(pathname.split("?")[1]);
}

// 匹配路径和当前路径名
export function matchPath(path, pathname) {
    // let matcher = compilePath(path);
    let [matcher, paramNames] = compilePath(path);
    let match = pathname.match(matcher);
    // match 结果为 ['/user/123', '123']
    // match: 0:  "/post/2" 1: "2" groups: undefined index: 0 input: "/post/2" length: 2
    if (!match) return null;
    // return match;

    // 如果匹配成功，提取参数值，组装成对象。
    // 如 { values: [ "2"], matchedPathname: '/post/2' }
    let [matchedPathname, ...values] = match;
    // [ 'id' ]
    let params = paramNames.reduce(
        (memo, paramName, index) => {
            memo[paramName] = values[index];
            return memo;
        },
        {}
    );
    return { params, matchedPathname };
}

// route 中的属性变成正则表达式
// 将带有参数的路由路径（如 /user/:id）转换为能提取参数的正则表达式，并记录参数名
function compilePath(path) {
    let paramNames = [];
    // 只是把 path 直接拼成正则，不支持参数提取。例如 /user/:id 会变成 /^/user/:id$/，
    // 只能匹配字符串完全等于 /user/:id，不能匹配 /user/123。
    // let regexpSource = "^" + path;
    // 把 :id 这样的参数占位符替换成正则分组 ([^\/]+)，并把参数名 id 存到 paramNames 数组。
    let regexpSource = "^" + path
        .replace(/:(\w+)/g, (_, key) => {
            paramNames.push(key);
            return "([^\\/]+)";
        });
    regexpSource += "$";
    let matcher = new RegExp(regexpSource);
    // return matcher;
    return [matcher, paramNames];
}


// 定义Route函数组件（空实现）
export function Route(props) { }
// 编译路径为正则表达式
