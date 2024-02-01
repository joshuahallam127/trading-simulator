import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import HomePage from './components/HomePage';
import SelectStock from './components/SelectStockPage';
import Simulator from './components/SimulatorPage';
import Results from './components/ResultsPage';
import UpdatedPage from './components/UpdatedPage';

const router = createBrowserRouter([
  {
    path: '/trading-simulator/',
    element: <HomePage />,
  },
  {
    path: '/trading-simulator/App',
    element: <App />,
  },
  {
    path: '/trading-simulator/SelectStock',
    element: <SelectStock />,
  },
  {
    path: '/trading-simulator/Simulator/:ticker',
    element: <Simulator />,
  },
  {
    path: '/trading-simulator/About',
    element: <Simulator />,
  },
  {
    path: '/trading-simulator/Results/:resultsArray',
    element: <Results />,
  },
  {
    path: '/trading-simulator/UpdatedPage',
    element: <UpdatedPage />,
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
