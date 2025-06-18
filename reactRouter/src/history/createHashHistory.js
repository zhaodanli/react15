/**
 * createHashHistory 函数创建了一个自定义的历史对象，用于管理网页应用中的导航状态。
 * 使用栈结构来存储历史记录，通过 push 和 go 方法来添加和移动历史记录。
 * listen 方法允许其他部分的代码注册监听器，这些监听器在历史记录改变时被调用。
 * handleHashChange 方法监听浏览器的 hashchange 事件，以响应 URL 的哈希部分的变化。
 * 最后，函数返回这个自定义历史对象，允许其他代码通过这个对象 
 * V5 如果没有默认hash会添加默认hash, v6没有了
 * 数据流转总结
 *  1. 历史记录栈（stack）与索引（index）
 *      所有历史记录（每次 push 的 pathname 和 state）都存入 stack 数组，index 指向当前活跃的历史记录。
 *      每次 push、go、hashchange 都会更新 stack 和 index，保证历史可前进/后退。
 *  2. 状态（state）与路径（pathname）
 *      每次 push 时可传递自定义 state，和 pathname 一起组成 location。
 *      location 结构：{ pathname, state }，同步到 history.location。
 *  3. 监听器（listeners）
 *      通过 listen 注册的回调函数数组，任何历史变化（push/go/hashchange）都会通知所有监听器，驱动外部响应（如组件 setState）。
 *  4. 动作（action）
 *      每次路由变化会设置 action（'PUSH'、'POP'），同步到 history.action，供外部判断本次变化类型。
 *  5. hashchange 事件驱动
 *      监听 window 的 hashchange 事件，自动更新 location、action、stack，并通知所有 listeners。
 * @returns 
 */
// 定义一个函数 createHashHistory
function createHashHistory() {
    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 数据初始化 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 声明一个栈来存储历史记录
    let stack = []; // browser 是从 window.history 取的
    // 当前位置的索引
    let index = -1;
    // 当前动作（默认为'POP'）
    let action = 'POP';
    // 当前的状态
    let state;
    // 监听函数数组
    let listeners = [];

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 数据监听 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 添加一个监听函数
    function listen(listener) {
        // 将监听器添加到数组中
        listeners.push(listener);
        // 返回一个函数，用于移除监听器
        return () => {
            listeners = listeners.filter(item => item !== listener);
        };
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 基础函数 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

    // 移动到历史记录中的某个位置
    function go(n) {
        // 设置动作为'POP'
        action = 'POP';
        // 更新索引
        index += n;
        // 获取新位置的历史记录
        let nextLocation = stack[index];
        // 更新状态
        state = nextLocation.state;
        // 更新浏览器的哈希值
        window.location.hash = nextLocation.pathname;
    }

    // 后退
    function goBack() {
        // 调用 globalHistory.go 函数后退一步
        globalHistory.go(-1);
    }

    // 前进
    function goForward() {
        // 调用 globalHistory.go 函数前进一步
        globalHistory.go(1);
    }
    

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 关键函数 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 添加一个新的历史记录
    function push(pathname, nextState) {
        // 设置动作为'PUSH'
        action = 'PUSH';
        // 检查 pathname 是否为对象
        if (typeof pathname === 'object') {
            // 从对象中获取 state 和 pathname
            state = pathname.state;
            pathname = pathname.pathname;
        } else {
            // 使用提供的 nextState
            state = nextState;
        }
        // 更新浏览器的哈希值， 触发哈希监听
        window.location.hash = pathname;
    }

    // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> hash监听函数 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
    // 监听 hashchange 事件
    window.addEventListener('hashchange', handleHashChange);
    
    // 处理哈希值变化的函数
    function handleHashChange() {
        // >>>>>>>>>>>>>>  更新数据 <<<<<<<<<<<<<<<<<<<<
        // 获取新的 pathname
        const pathname = window.location.hash.slice(1);
        // 更新历史对象的 action
        history.action = action;
        // 构建新的 location 对象
        const location = {
            pathname,
            state
        };
        // 更新历史对象的 location
        history.location = location;

        // >>>>>>>>>>>>>>  处理栈 <<<<<<<<<<<<<<<<<<<<
        // 如果是 PUSH 动作，更新栈和索引
        if (action === 'PUSH') {
            // stack[0] = location
            stack[++index] = location;
        }
        // 通知所有监听器
        listeners.forEach(listener => {
            listener({
                action,
                location
            });
        });
    }

    // 创建一个历史对象
    const history = {
        action: 'POP',
        go,
        goBack,
        goForward,
        push,
        listen,
        location: {
            pathname: undefined,
            state: undefined
        }
    };

    // 初始化历史对象
    if (window.location.hash) {
        action = 'PUSH';
        handleHashChange();
    } else {
        // V5 如果没有默认hash会添加默认hash, v6没有了。这个本身没有
        // window.location.hash = '/';
    }
    // 返回创建的历史对象
    return history;
}
// 导出 createHashHistory 函数
export default createHashHistory;