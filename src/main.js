import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App';


const root = document.getElementById('root');
// createRoot(root).render(<APP />);
hydrateRoot(root, <App />)