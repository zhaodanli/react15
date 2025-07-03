import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import StyleContext from 'isomorphic-style-loader-react18/StyleContext'
import { getClientStore } from '../store';
import App from '../App';
import { HistoryRouter as Router } from "redux-first-history/rr6";
// import { _insertCss } from '../../build/server';
const { store, history } = getClientStore();

const root = document.getElementById('root');

const insertCss = (...styles) => {
    const removeCss = styles.map(style => style._insertCss())
    return () => removeCss.forEach(dispose => dispose())
}

// let style = {
//     css: '.color{color:red}',
//     _insertCss() {
//         let styleEle = document.createElement('style');
//         style.innerHTML = style.css;
//         document.head.appendChild(styleEle);
//         return () => {
//             styleEle.remove();
//         }
//     }
// }

// hydrateRoot(root, <BrowserRouter><App store={store} /></BrowserRouter>);
// hydrateRoot(root, <Router history={history}><App store={store} /></Router>);
hydrateRoot(root,
    <Router history={history}>
        <StyleContext.Provider value={{ insertCss }}>
            <App store={store} />
        </StyleContext.Provider>
    </Router>);