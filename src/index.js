import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
const root = document.getElementById('root');
hydrateRoot(root, <BrowserRouter><App /></BrowserRouter>);