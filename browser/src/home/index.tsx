import React from 'react';
import { createRoot } from 'react-dom/client';
import { HomePage } from './HomePage';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<HomePage />);
