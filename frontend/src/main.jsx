// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. 在这里导入 Router
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
        <App />
  </React.StrictMode>,
);
