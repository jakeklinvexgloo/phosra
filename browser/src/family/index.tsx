import React from 'react';
import { createRoot } from 'react-dom/client';
import { FamilyDashboardPage } from './FamilyDashboardPage';
import './styles.css';

const root = createRoot(document.getElementById('root')!);
root.render(<FamilyDashboardPage />);
