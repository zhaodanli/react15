import { match } from "path-to-regexp";
// 导入React库
import React from "react";
// 创建导航上下文
const NavigationContext = React.createContext({});
// 创建位置上下文
const LocationContext = React.createContext({});

const RouteContext = React.createContext({});
// 导出上下文
export { NavigationContext, LocationContext };

/**
 * 这套机制本质上用的是**“上下文（Context）模式”**，属于“依赖注入”思想的一种实现方式。在设计模式分类中，最接近的是：
 * 责任链模式（Chain of Responsibility Pattern）：每一层 Provider 形成一条链，嵌套的组件可以沿着链向上查找所需的数据（如参数、outlet）。
 * 组合模式（Composite Pattern）：每个路由节点既可以包含子节点（嵌套路由），也可以作为叶子节点（终结路由），整体形成树状结构。
 * 上下文模式（Context Pattern）/依赖注入：通过 React 的 Context API，把数据（如 matches、outlet）注入到组件树的任意层级，避免了层层 props 传递。
 * 总结：
 * 主要是“责任链模式”+“上下文模式（依赖注入）”，结合 React Context 实现多级嵌套路由的数据传递和解耦。
 */
/**
 * 这段代码是一个React路由管理工具的实现，包括创建上下文（NavigationContext和LocationContext），
 * 定义路由器（Router）和路由（Routes，Route），
 * 以及一些自定义钩子（useLocation, useSearchParams, useRoutes）用于管理路由状态和解析URL参数。
 * 核心功能是根据React的子组件定义动态路由，以及提供路径匹配功能。
 * 代码风格注重模块化和可复用性，适合用于构建复杂的单页应用程序。
 * 
 * Router -> createRoutesFromChildren -> useRoutes
 * createRoutesFromChildren 把子元素配置成数组， 使用 useRoutes 进行渲染
 * @param {*} param0 
 * @returns 
 */
// 定义Router函数组件
// 这里的 history 就是 createBrowserHistory/createHashHistory 返回的对象，包含 push/replace/go 等方法。
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
// Routes -> useRoutes -> matchRoutes -> 排序
export function Routes({ children }) {
    // 使用useRoutes钩子创建路由,获取路由规则获取到的数组
    return useRoutes(createRoutesFromChildren(children));
}

// 从子元素创建路由数组
/**
 * { path: "/", element: Home }
 * { path: "/user", element: User children: [
    *  { path: "add", element: UserAdd }
    *  { path: "list", element: UserList } ? 匹配到了 User
    *  { path: "detail/:id", element: UserDetail }
 * ]}
 */
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
        // 检查当前处理的元素（element）是否有子元素（element.props.children）。
        // 如果有子元素，递归地调用 createRoutesFromChildren 函数，将这些子元素转换为路由配置。
        // 将得到的子路由配置数组赋值给当前路由对象的 children 属性。
        if (element.props.children) {
            route.children = createRoutesFromChildren(element.props.children);
        }
        routes.push(route);
    });
    return routes;
}

// 定义useRoutes钩子 接收定义好的数组 routes， 拿当前 loacation 和数组匹配
// useRoutes -> matchRoutes
export function useRoutes(routes) {
    // 获取当前位置
    let location = useLocation();
    let pathname = location.pathname;
    // 增加了matchRoutes函数 匹配流程
    let matches = matchRoutes(routes, pathname);
    // return null;
    // 返回渲染结果
    return _renderMatches(matches);
}

function _renderMatches(matches) {
    if (!matches) {
        return null;
    }

    /**
     * RouteContext.Provider 给 useParams传递值
     * 这段代码的作用是递归地为每一层嵌套路由提供上下文（RouteContext），从而让嵌套的 <Outlet />、useParams()、useOutlet() 能正确获取当前路由的参数和嵌套出口
     * 递归包裹：从最深层的匹配路由开始，逐层向外包裹，每一层都用 <RouteContext.Provider> 提供当前层的参数和 outlet。
     * outlet：每一层的 outlet 就是下一级嵌套路由渲染的内容（即 <Outlet /> 的实际内容）。
     * matches：每一层的 matches 包含从根到当前层的所有匹配信息，便于参数提取。
     * 假设你的路由结构如下：
        * <Route path="/user" element={<User />}>
        *   <Route path="detail/:id" element={<UserDetail />} />
        * </Route>
     * 访问 /user/detail/123 时，matches 结果为：
     * [{ route: { path: '/user', ... }, params: {} },
     * { route: { path: 'detail/:id', ... }, params: { id: '123' } }]
     * 会生成如下嵌套结构：
     * <RouteContext.Provider value={{ outlet: null, matches: [User, UserDetail] }}>
     *  // 也就是说，User 组件里如果用 <Outlet />，就会渲染 UserDetail 相关的内容。
        * <UserDetail />
    * </RouteContext.Provider>
    * <RouteContext.Provider value={{ outlet: 上一步的Provider, matches: [User] }}>
        * <User>
            * <Outlet />  // 实际上就是上面那一层的 RouteContext.Provider
        * </User>
     * </RouteContext.Provider>
     * 这样 <User /> 里的 <Outlet /> 会渲染 <UserDetail />，并且每一层都能通过 context 拿到自己的参数和 outlet。
     * outlet 累加器/上一次的返回值
     * match 当前遍历到的元素
     * idx 当前索引
     * initialValue null
     * reduceRight 从最后一位开始
     * 第一次：index=1，match=UserDetail层，outlet=null
     * 第二次：index=0，match=User层，outlet=上一步的 RouteContext.Provider
     */
    return matches.reduceRight((outlet, match, index) => (
        <RouteContext.Provider value={{ outlet, matches: matches.slice(0, index + 1) }}>
            {match.route.element}
        </RouteContext.Provider>
    ), null)
}

// 这个函数用于匹配给定路径（pathname）与一组路由配置（routes）。
// 它首先通过flattenRoutes函数将路由配置扁平化，然后遍历这些路由，尝试匹配每个路由分支。
function matchRoutes(routes, pathname) {
    // 打平路径
    const branches = flattenRoutes(routes);
    console.log(branches)
    // 给分支排序
    rankRouteBranches(branches);
    // console.log(branches)
    // 一次进行分支匹配
    // branches: { routeMetas: {}, routePath}
    let matches = null;
    for (let i = 0; matches == null && i < branches.length; i++) {
        // 这个函数用于匹配单个路由分支。
        matches = matchRouteBranch(branches[i], pathname);
    }
    return matches;
}


// 这个函数用于匹配单个路由分支。
// 它会遍历路由分支中的每个路由，检查当前路径是否与这些路由匹配。
// 匹配是通过matchPath函数完成的，该函数会考虑路由的路径模式和是否为终结路径。
/** 比如你访问 /user/123，这条路径会依次经过这三个路由。
 * 它会一段一段地把 /user/123 拆开，依次和每一级路由的 path 匹配。
 * 每一级匹配成功后，把参数（如 id）提取出来，继续往下匹配剩下的路径。
 * 假设你有如下分支：你要匹配的路径是 /user/123。
 * const branch = {
  routeMetas: [
    { route: { path: '/', element: <Home /> } },
    { route: { path: 'user', element: <User /> } },
    { route: { path: ':id', element: <UserDetail /> } }
  ]
};
 * 第1级匹配（path: '/'，end: false）
 * 剩余路径：remainingPathname = '/user/123'
 * 匹配 /，成功（因为 /user/123 以 / 开头）
 * 已匹配路径：/
 * 匹配第二级 user
 * 剩余路径：user/123（去掉前面的 /）
 * 匹配 user，成功（user/123 以 user 开头
 * 已匹配路径：/user
 * 匹配第三级 :id
 * 剩余路径：/123
 * 匹配 :id，成功（/123 匹配参数 id=123）
 * 参数：{ id: '123' }
 * 每一级都匹配成功，返回每一级的路由和参数。
 * 你就知道 /user/123 这条路径，依次经过了 /、user、:id 这三个路由，并且参数 id=123。
 * { route: { path: 'user' }, params: {} },
   { route: { path: ':id' }, params: { id: '123' } }
 *  */
function matchRouteBranch(branch, pathname) {
    // 取出 routeMetas 数组
    const { routeMetas } = branch;
    const matches = []; // 匹配到的数组，最终输出对象
    let matchedParams = {}; // 匹配到的参数
    let matchedPathname = ''; // 已经匹配过的路径名

    // 遍历数组
    for (let i = 0; i < routeMetas.length; i++) {
        // 取出 meta 对应的路由对象
        const { route } = routeMetas[i];

        // 判断是不是最后一个
        const end = i === routeMetas.length - 1;
        // 找到剩下的路径名 '/user/123' 'user/123' '/123'
        const remainingPathname = pathname.slice(matchedPathname.length);
        // 路由对象的路径和剩下待匹配路径得到匹配结果
        const match = matchPath({ path: route.path, end }, remainingPathname);
        if (!match) {
            return null;
        }
        matchedParams = Object.assign({}, matchedParams, match.params);
        // { route: { path: '/' }, params: {} },
        //   { route: { path: 'user' }, params: {} },
        //   { route: { path: ':id' }, params: { id: '123' } }
        matches.push({ route, params: matchedParams });
        // matchedPathname = '/' '/user' '/user/123'
        matchedPathname = joinPaths([matchedPathname, match.matchedPathname]);
    }
    return matches;
}

/** 将路由配置扁平化，然后遍历这些路由，尝试匹配每个路由分支。 把多维变一维，打平分支
 * 如果找到匹配的路由分支，它会记录匹配信息并返回。
 * { routePath: "/", routeMetas: {}}
 * { routePath: "/user/add", routeMetas: {}}
 * { routePath: "/user/list", routeMetas: {}}
 * { routePath: "/user/detail/:id", routeMetas: {}}
 * { routePath: "/user", routeMetas: {}}
 * @param {原始router数组} routes  { path, element, children}
 * @param {分支数组} branches 
 * @param {父meta数组} parentMetas 
 * @param {父路径} parentPath 
 * @returns 
 */
function flattenRoutes(routes, branches = [], parentMetas = [], parentPath = '') {
    // 遍历路由数组匹配当前路径
    // for (let i = 0; i < routes.length; i++) {
    //     let { path, element } = routes[i];
    //     // 路由惠泽中的路径和当前浏览器的路径匹配，对一个匹配的
    //     let match = matchPath(path, pathname);
    //     if (match) {
    //         // 返回并渲染
    //         return element;
    //     }
    // }
    routes.forEach((route, index) => {
        // 一个 route 对应一个 routeMeta 路由匹配元数据
        let routeMeta = {
            route,
            // 每个路由在其父节点 children 数组中的下标（即声明顺序）。当多个分支的精确度（score）一样时，优先匹配在路由树中声明靠前的分支，保证路由匹配的可预期性。
            childrenIndex: index,
        }
        const routePath = joinPaths([parentPath, routeMeta.route.path])
        const routeMetas = [...parentMetas, routeMeta];
        if (route.children) {
            flattenRoutes(route.children, branches, routeMetas, routePath);
        }
        branches.push({
            routePath,
            routeMetas,
            score: computeScore(routePath, index), // 为排序做准备
        })
    })
    return branches;
}

function joinPaths(paths) {
    // 用/链接，将两个/替换成一个/
    return paths.join('/').replace(/\/+/g, '/');
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
// 这个函数用于检查给定的路径是否匹配特定的路由路径模式。
// 它利用由compilePath生成的正则表达式进行匹配。
// 如果匹配成功，它会返回匹配的路径和解析出的路由参数。
export function matchPath({ path, end }, pathname) {
    // let matcher = compilePath(path);
    let [matcher, paramNames] = compilePath(path, end);
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
// 这个函数被用于将路由的路径模式编译成正则表达式。
// 它处理路径中的参数，并生成相应的正则表达式和参数名称列表。
function compilePath(path, end) {
    // 路径参数名数组
    let paramNames = [];
    // 只是把 path 直接拼成正则，不支持参数提取。例如 /user/:id 会变成 /^/user/:id$/，
    // 只能匹配字符串完全等于 /user/:id，不能匹配 /user/123。
    // let regexpSource = "^" + path;
    // 把 :id 这样的参数占位符替换成正则分组 ([^\/]+)，并把参数名 id 存到 paramNames 数组。
    // 新增的.replace(/^\/*/, '/')确保路径以单个斜杠开始，而.replace(/\/+/g, '/')将连续的斜杠替换为单个斜杠
    let regexpSource = "^" + path
        .replace(/:(\w+)/g, (_, key) => {
            paramNames.push(key);
            return "([^\\/]+)";
        })
        .replace(/^\/*/, '/'); // 把开头的0+个/转成/
    // regexpSource += "$";
    if (end) {
        regexpSource += "\\/*$"; // 结尾可以是多个/
    }

    if (path === '*') {
        regexpSource = '.*';
    }
    let matcher = new RegExp(regexpSource);
    // return matcher;
    return [matcher, paramNames];
}


// 定义Route函数组件（空实现）
export function Route(props) { }
// 编译路径为正则表达式


/**
 * NavigationContext 是通过 React.createContext 创建的，通常在路由库（如 react-router）内部。
 * 在 <NavigationContext.Provider value={...}> 时，value 里会包含一个 navigator 对象。
 * 这个 navigator 对象通常就是自定义的 history 对象（如 browserHistory/hashHistory）
 * 它实现了 push、replace、go 等方法。
 */
export function useNavigate() {
    // 获取 navigator， 执行push
    let { navigator } = React.useContext(NavigationContext);
    let navigate = React.useCallback((to, options = {}) => {
        navigator.push(to, options.state);
    }, [navigator])
    return navigate;
}

export function Outlet() {
    return useOutlet();
}

export function useOutlet() {
    return React.useContext(RouteContext).outlet;
}

export function useParams() {
    const { matches } = React.useContext(RouteContext);
    return matches[matches.length - 1].params;
}

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 排序逻辑 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
// 这些改进使得路由系统能够更好地处理复杂的路由情况，特别是在大型应用程序中，其中可能有许多不同级别的嵌套路由，以及需要精确匹配和排序的动态路由。通过引入这种分数和排序机制，可以确保应用程序总是按照预期的方式响应 URL 更改。

// 检查字符串是否是一个通配符 (*)。
const isSplat = s => s === '*';

// 这些常量用于在计算路由分数时使用，以帮助确定路由的匹配优先级。
const splatPenalty = -2;
const indexRouteValue = 2;

// 通配符，路径参数的正则表达式 :/d+
const paramRe = /^:\w+$/;
// 动态值
const dynamicSegmentValue = 3;
// 空值
const emptySegmentValue = 1;
// 静态值
const staticSegmentValue = 10;
// >>>>>>>>>>>>>>>> 打平前做准备 <<<<<<<<<<<<<<<<<
/** 计算路由的分数，用于确定匹配的优先级。
 * 它考虑了路由路径的不同部分（如静态片段、动态片段、空片段等）以及是否是索引路由或包含通配符。
 * score 越高，路由越精确/优先
 * 如果 score 相同，则用 compareIndexes 比较 childrenIndex，保证同级路由的顺序和声明顺序一致。
 * [
  { path: "/user/list" },      // 静态路径 （score最高，最精确）
  { path: "/user/:id" },       // 动态参数
  { path: "/user/*" },         // 通配符
  { path: "/:any" }            // 根级动态参数 （score最低，最宽泛）
]
 */
function computeScore(path, index) {
    // 分片
    let segments = path.split('/'); // ['', user, add]
    // 分片长度作为初始值
    let initialScore = segments.length;
    // 分片是*罚-2分
    if (segments.some(isSplat)) {
        initialScore += splatPenalty;
    }

    // index有值就+2
    if (index !== undefined) {
        initialScore += indexRouteValue;
    }

    // 过滤掉*
    return segments.filter(s => !isSplat(s)).reduce((score, segment) => {
        // score + 片段判断（路径参数+3 空+1 + 非空+10）
        return score + (paramRe.test(segment) ? dynamicSegmentValue : segment === '' ? emptySegmentValue : staticSegmentValue);
    }, initialScore)
}

// >>>>>>>>>>>>>>>> 排序 <<<<<<<<<<<<<<<<<
/** 对路由分支进行排序，基于 computeScore 函数计算的分数。
 * 这个函数现在在匹配路由之前会调用 rankRouteBranches 函数，以确保路由是根据优先级排序的。
 * @param {*} branches 
 */
function rankRouteBranches(branches) {
    branches.sort((a, b) => {
        return a.score !== b.score ? b.score - a.score : compareIndexes(
            a.routeMetas.map(meta => meta.childrenIndex),
            b.routeMetas.map(meta => meta.childrenIndex)
        )
    })
}

// 用于比较两个分支的 childrenIndex 数组（每一级的下标），如果它们除了最后一级都一样（即同父节点下的兄弟节点），就比较最后一级的下标，谁小谁优先。
/**
 * user/add = [2,0]
 * user/list = [2,1]
 */
function compareIndexes(a, b) {
    // 长度相同，并且除最后一个索引外的其他索引全相等，说明他们是兄弟
    let sibling = a.length === b.length && a.slice(0, -1).every((n, i) => n === b[i])
    // 兄弟看索引，索引越小，优先级越高，不是兄弟则认为他们是相等的
    // 如果比较函数返回 0，表示这两个元素的顺序不变（保持原数组中的相对顺序）。
    // 也就是说，最终这两个分支的优先级是一样的，谁先声明谁先匹配（稳定排序）。
    return sibling ? a[a.length - 1] - b[b.length - 1] : 0;
}

export function Navigate({ to }) {
    let navigate = useNavigate();
    React.useLayoutEffect(() => {
        navigate(to)
    });
    return null;
}
