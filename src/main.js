import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import APP from './APP';


const root = document.getElementById('root');
// createRoot(root).render(<APP />);
hydrateRoot(root, <App />)