import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { getClientStore } from '../store';
import App from '../App';

const store = getClientStore();
const root = document.getElementById('root');
hydrateRoot(root, <BrowserRouter><App store={store} /></BrowserRouter>);