import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './components/HomePage';
import Simulator from './components/SimulatorPage';
import Setup from './components/Setup';

const router = createBrowserRouter([
  {
    path: '/trading-simulator/',
    element: <HomePage />,
  },
  {
    path: '/trading-simulator/Setup',
    element: <Setup />,
  },
  {
    path: '/trading-simulator/Simulator/:ticker/:startMonth/:endMonth',
    element: <Simulator />,
  },
]);

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
