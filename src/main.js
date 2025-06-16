import React from 'react'
import { createRoot } from 'react-dom/client'
const root = document.getElementById('root');
import APP from './APP';
const element = <APP />
createRoot(root).render(element);