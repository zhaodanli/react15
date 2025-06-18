import { HashRouter, BrowserRouter, Routes, Route } from "./react-router-dom";
// 引入react-router-dom中的HashRouter, BrowserRouter, Routes, Route组件
import Home from "./components/Home";
import User from "./components/User";
import Profile from "./components/Profile";
import Post from './components/Post';

/** HashRouter, BrowserRouter 差异被抹平， 只是路径方式不同
 * 
 * @returns 
 */
export default function App() {
    /**
     * 使用 HashRouter 包裹我们的应用程序
     * 定义了 Routes 组件，所有的 Route 组件都被包含在其中。
     * 注意 Route 组件的新用法，将要渲染的组件作为 element 属性传递进去。当 URL 的路径与 Route 的 path 属性匹配时，就会渲染对应的 element。
     * 测试： http://localhost:5178/#/
     */
    return (
        // 使用HashRouter包裹整个应用，实现哈希路由功能
        <HashRouter>
            {/* // 定义路由规则 */}
            <Routes>
                {/* // 定义主页路由，当URL为'/'时渲染Home组件 */}
                <Route path="/" element={<Home />} />
                {/* // 定义用户页面路由，当URL为'/user'时渲染User组件 */}
                <Route path="/user" element={<User />} />
                {/* // 定义个人资料页面路由，当URL为'/profile'时渲染Profile组件 */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/post/:id" element={<Post />} />
            </Routes>
        </HashRouter>
    )

    // 测试 http://localhost:5180/user
    // BrowserRouter 函数组件 -> 获取 history.location、children、action，navigator -> Router -> NavigationContext.Provider -> LocationContext.Provider -> Routes -> 找到匹配路径， 渲染elemnt
    // 获取 history.location、children、action，navigator 关系
    // useState{action: history.action,location: history.location, navigator: history }
    // navigator(history): {action, location}
    return (
        <BrowserRouter>
            {/* // 定义路由规则 */}
            <Routes>
                {/* // 定义主页路由，当URL为'/'时渲染Home组件 */}
                <Route path="/" element={<Home />} />
                {/* // 定义用户页面路由，当URL为'/user'时渲染User组件 */}
                <Route path="/user" element={<User />} />
                {/* // 定义个人资料页面路由，当URL为'/profile'时渲染Profile组件 */}
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    )
}