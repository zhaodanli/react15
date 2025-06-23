import Home from './components/Home.jsx';
import Counter from './components/Counter.jsx';

import { Routes, Route, Link, BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HistoryRouter } from './redux-first-history/rr6/index.jsx';
import { store, reduxHistory } from "./store";

/** 目前 react-router-dom 官方最高稳定版为 6.x，7.x 不是官方正式版，和 redux-first-history 及相关生态完全不兼容，会导致 context 结构不一致、Link 报错等各种问题
 * redux-first-history@5.x 只支持 react-router-dom@6.x，不支持 7.x
 * @returns 
 */
function App() {
    return (
        <Provider store={store}>
            <HistoryRouter history={reduxHistory}>
            {/* <BrowserRouter> */}
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/counter">Counter</Link></li>
                </ul>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/counter" element={<Counter />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            {/* </BrowserRouter> */}
            </HistoryRouter>
        </Provider>
    )
}

export default App