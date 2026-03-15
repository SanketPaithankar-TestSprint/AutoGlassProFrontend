import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'; // Initialize i18n before app renders
import './index.css'
import AppRoutes from './App.jsx'
import 'antd/dist/reset.css'; // For Ant Design v5+
import { App, ConfigProvider } from 'antd';
import { setupFetchInterceptor } from './utils/fetchInterceptor';
import { HelmetProvider } from 'react-helmet-async';

// Initialize Global Safeguards
setupFetchInterceptor();

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <ConfigProvider
      theme={{
        token: {
          fontFamily: "'Poppins', sans-serif", // Force Poppins globally in Ant components
        },
        components: {
          Card: {
            paddingLG: 24,
            headerBg: 'transparent',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.04)',
            borderColor: 'rgba(0, 0, 0, 0.05)',
          },
        },
      }}
    >
      <App>
        <AppRoutes />
      </App>
    </ConfigProvider>
  </HelmetProvider>,
)
