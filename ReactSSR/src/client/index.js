import React from 'react';
import { hydrateRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
import { getClientStore } from '../store';
import App from '../App';
import { HistoryRouter as Router } from "redux-first-history/rr6";
const { store, history } = getClientStore();

const root = document.getElementById('root');
// hydrateRoot(root, <BrowserRouter><App store={store} /></BrowserRouter>);
hydrateRoot(root, <Router history={history}><App store={store} /></Router>);