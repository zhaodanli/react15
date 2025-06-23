import { useDispatch } from 'react-redux';
import { push } from "../redux-first-history";
import { useNavigate } from 'react-router-dom';

function Home() {
    // const navigate = useNavigate();
    const dispatch = useDispatch();
    const gotoCounter = () => {
        // navigate('/counter');
        // 这里的 push('/counter') 实际上是 actions.js 里生成的 action，type 为 CALL_HISTORY_METHOD。
        // redux 调用中间件，发现 action.type 是 CALL_HISTORY_METHOD。
        // 取出 payload.method = 'push'，payload.args = ['/counter']。
        // 执行 history.push('/counter')，真正改变浏览器地址。
        // history 变化后，create.js 里 history.listen 监听到变化。
        // 立即 dispatch 一个 LOCATION_CHANGE action，包含最新的 location 和 action。
        // reducer.js 同步路由状态 reducer.js 监听 LOCATION_CHANGE，把最新的 location、action 写入 redux 仓库的 router 分支。
        // 这样组件可以通过 redux 读取到最新的路由状态。
        //  dispatch(push('/counter')) → middleware 自动调用 history.push → history 变化 → create.js 监听到变化，dispatch LOCATION_CHANGE → reducer 更新 redux 路由状态。
        // 这样实现了“用 redux action 控制路由跳转，并同步路由状态到 redux”。

        dispatch(push('/counter'));
    }
    return (
        <div>
            <p>Home</p>
            <button onClick={gotoCounter}>跳转到/counter</button>
        </div>
    )
}
export default Home;