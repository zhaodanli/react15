import dva, { connect } from './dva/index.tsx';

import Counter1 from './components/Counter1'
import type{ Counter1State } from './components/Counter1'
import counter1Model from './components/counter1.model.ts'
import counter2Model from './components/counter2.model.ts'
// import Counter2 from './components/Counter2'
// import type { Counter2State } from './components/Counter2'
// // import keymaster from 'keymaster';
// // import { RouterAPI } from './dva';
// // import { Router, Route } from './dva/router';

interface CombinedState {
    counter1: Counter1State;
    // counter2: Counter2State;
}


// 创建应用，返回 dva 实例
const app = dva();

// 配置 hooks 或者注册插件 app.use(hooks)

// 注册 model
app.model(counter1Model);

const mapStateToProps1 = (state: CombinedState): Counter1State => state.counter1;
const ConnectedCounter = connect(
    mapStateToProps1
)(Counter1);
// const mapStateToProps2 = (state: CombinedState): Counter2State => state.counter2;
// const ConnectedCounter2 = connect(
//     mapStateToProps2
// )(Counter2);

// 注册路由表 app.router(({ history, app }) => RouterConfig)
app.router(() => <ConnectedCounter />);

// app.router(
//     (api?: RouterAPI) => {
//         let { history } = api!;
//         return (
//             (
//                 <Router history={history}>
//                     <>
//                         <Route path="/counter1" component={ConnectedCounter} />
//                         <Route path="/counter2" component={ConnectedCounter2} />
//                     </>
//                 </Router>
//             )
//         )
//     }
// );

// 启动应用
app.start();
