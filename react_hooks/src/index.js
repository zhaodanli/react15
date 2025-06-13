import React from 'react';
import ReactDOM from 'react-dom/client';

import 'bootstrap/dist/css/bootstrap.css';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import APP from './APP.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<APP />)
