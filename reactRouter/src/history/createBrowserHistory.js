/** createBrowserHistory 函数用于创建一个自定义的浏览器历史管理对象。
 * 这个对象允许应用程序(监听和操作)浏览器的历史记录。
 * 它提供了几个关键功能：添加新的历史记录（push）、替换当前记录（replace）、前进和后退（go、goBack、goForward）、以及订阅历史变化事件（listen）。这个函数利用了浏览器的 History API 和 popstate 事件来实现这些功能。
 * 文件的数据流转可以总结为：
        1. 路由状态的流转
        state：每次 push/replace 时传递的自定义状态，存储在 window.history.state，并同步到 history 对象的 location.state。
        location：每次路由变更（push/replace/popstate）都会生成新的 location（包含 pathname 和 state），同步到 history 对象，供外部读取。
        2. 监听器的注册与通知
        listeners ：通过 listen 方法注册的回调数组。每次路由变更（push/replace/popstate）时，所有 listeners 都会被依次调用，通知外部“路由已变更”。
        组件通过 history.listen(setState) 订阅路由变化，history 变化时自动 setState，驱动组件更新。组件卸载时，listen 返回的销毁函数会移除对应 listener，防止内存泄漏。
        3. 路由操作的数据流
        push(pathname, state)：调用时会更新浏览器地址栏（pushState），并通知所有 listeners，传递 action='PUSH' 和新的 location。
        replace(pathname, state)：类似 push，但用 replaceState 替换当前历史记录。
        go/goBack/goForward：调用浏览器原生 history API，前进/后退/跳转历史记录。
        popstate 事件：用户点击浏览器前进/后退按钮时触发，自动通知所有 listeners，action='POP'。
        4. history 对象的同步
        每次路由变更（push/replace/popstate），都会同步更新 history.action、history.location、history.length，保证外部读取到的 history 状态始终最新。
        总结
        核心数据流：路由变更（push/replace/popstate）→ 更新 location/state → 通知所有 listeners → 组件 setState → 视图更新。
        监听器流转：注册/移除监听器，保证组件生命周期内响应路由变化。
        状态同步：history 对象始终反映最新的 action/location/length，供外部读取和判断。
        该文件实现了前端路由的“响应式”数据流转，是 SPA 路由系统的基础。
 * @returns 
 */

// 定义 createBrowserHistory 函数
function createBrowserHistory() {
    // 获取全局历史对象
    const globalHistory = window.history;

    // 定义状态变量
    let state;
    // 初始化监听器数组

    // >>>>>>>>>>>>>>>>>>>>> 监听器的注册与通知 <<<<<<<<<<<<<<<<<<<<<
    let listeners = [];
    // 添加历史监听器 传进来 state
    /** listeners ：通过 listen 方法注册的回调数组
     * 每次路由变更（push/replace/popstate）时，所有 listeners 都会被依次调用,通知外部“路由已变更”。
     * 组件通过 history.listen(setState) 订阅路由变化
     * history 变化时自动 setState，驱动组件更新。
     * 组件卸载时，listen 返回的销毁函数会移除对应 listener，防止内存泄漏。
     *  useLayoutEffect(() => {
            // 这里是副作用逻辑（如事件监听、DOM操作等）
            console.log('副作用执行');

            // 返回一个函数，作为清理（销毁）函数
            return () => {
            // 这里是清理逻辑（如移除事件监听、取消定时器等）
            console.log('副作用清理');
            };
        }, []); // 依赖数组
     */
    function listen(listener) {
        // 把新的监听函数添加到了监听数组中
        listeners.push(listener);
        // 子组件销毁时取消监听
        return () => {
            listeners = listeners.filter(item => item !== listener);
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 实现简单方法 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 调用浏览器原生 history API，前进/后退/跳转历史记录。
    // 前进或后退指定的历史记录条数
    function go(n) {
        globalHistory.go(n);
    }

    // 后退一条历史记录
    function goBack() {
        globalHistory.go(-1);
    }

    // 前进一条历史记录
    function goForward() {
        globalHistory.go(1);
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 关键方法(路由状态的流转) <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    /**  添加新的历史记录
     * 路径改变，要通知所有监听函数，路径改变了
     * 1. 路由变更 生成新的 location 同步到 history 对象，供外部读取。
     * 调用时会更新浏览器地址栏（pushState），并通知所有 listeners，传递 action='PUSH' 和新的 location。
     * @param {*} pathname 
     * @param {自定义状态} nextState : window.history.state
     * 同步到 history 对象的 location.state
     */
    function push(pathname, nextState) {
        // 浏览器地址栏变为 /user
        // history.location 变为 { pathname: '/user', state: { userId: 123 } }
        // 所有监听器收到 { action: 'PUSH', location: { pathname: '/user', state: { userId: 123 } } }
        const action = 'PUSH';
        if (typeof pathname === 'object') {
            state = pathname.state;
            pathname = pathname.pathname;
        } else {
            state = nextState;
        }
        globalHistory.pushState(state, null, pathname);
        let location = { 
            pathname, // 会存到loacation.pathname
            state, // 会存到gloabalHistory上
        };
        // 接收动作 和 location
        notify({ action, location });
    }

    /** 替换当前历史记录
     * 2. 路由变更 生成新的 location 同步到 history 对象，供外部读取。
     * @param {*} pathname 
     * @param {自定义状态} nextState : window.history.state
     * 同步到 history 对象的 location.state
     */
    function replace(pathname, nextState) {
        // 浏览器地址栏变为 /profile（不会新增历史记录，只替换当前）
        // history.location 变为 { pathname: '/profile', state: { tab: 'info' } }
        // 所有监听器收到 { action: 'REPLACE', location: { pathname: '/profile', state: { tab: 'info' } } }
        const action = 'REPLACE';
        if (typeof pathname === 'object') {
            state = pathname.state;
            pathname = pathname.pathname;
        } else {
            state = nextState;
        }
        globalHistory.replaceState(state, null, pathname);
        let location = { pathname, state };
        notify({ action, location });
    }

    // 监听浏览器历史变化, 前进后退，go都会触发，路径也会改变 浏览器前进/后退按钮
    /** 监听路由变更
     * 3. 路由变更 生成新的 location 同步到 history 对象，供外部读取。
     * 用户点击浏览器前进/后退按钮时触发，自动通知所有 listeners，action='POP'。
     */
    window.addEventListener('popstate', () => {
        // 获取最新路径信息，通知
        let location = {
            state: globalHistory.state, // 来源于 window.history下的 globalHistory.state
            pathname: window.location.pathname
        };
        notify({ action: 'POP', location });
    });

    // 通知所有监听器
    function notify({ action, location }) {
        // 更新数据
        history.action = action;
        history.location = location;
        // 拿到全局 历史记录长度变更 没什么用
        history.length = globalHistory.length;
        // 通知所有监听函数执行
        listeners.forEach(listener => {
            listener({ action, location });
        });
    }

    // >>>>>>>>>>>>>>>>>>>>>>> 初始化 history 对象 <<<<<<<<<<<<<<<<<<<<<
    const history = {
        action: 'POP',
        go,
        goBack,
        goForward,
        push,
        replace,
        listen,
        location: { // 不同于 window.loaction 但是初始对象是从 window 取的
            pathname: window.location.pathname, // 路径名
            state: globalHistory.state // window.location.state
        }
    };
    // 返回 history 对象
    return history;
}

// 导出 createBrowserHistory 函数
export default createBrowserHistory;