import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'; // Initialize i18n before app renders
import './index.css'
import AppRoutes from './App.jsx'
import 'antd/dist/reset.css'; // For Ant Design v5+
import { App } from 'antd';
import { setupFetchInterceptor } from './utils/fetchInterceptor';
import { HelmetProvider } from 'react-helmet-async';

// Initialize Global Safeguards
setupFetchInterceptor();

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App>
      <AppRoutes />
    </App>
  </HelmetProvider>,
)
