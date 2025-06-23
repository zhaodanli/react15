import Home from './components/Home.jsx';
import Counter from './components/Counter.jsx';


import { Routes, Route, Link, BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux';
// import { HistoryRouter } from "redux-first-history/rr6";
// import { store, history } from "./store";

function App() {
    return (
        // <Provider store={store}>
            // <HistoryRouter history={history}>
            <BrowserRouter>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/counter">Counter</Link></li>
                </ul>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/counter" element={<Counter />} />
                </Routes>
            </BrowserRouter>
        // </Provider>
    )
}

export default App