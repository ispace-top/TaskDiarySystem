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
    {/* 2. 将 Router 作为最外层的包裹组件 */}
    <Router>
      {/* 3. AuthProvider 和 App 现在都位于 Router 内部，可以安全使用路由功能 */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);
