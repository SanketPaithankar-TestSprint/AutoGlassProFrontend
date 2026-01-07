import React, { useState, useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderPage from './components/OrderPage.jsx';
import Profile from './components/profile/Profile.jsx';
import Work from './components/work/Work.jsx';
import PricingPage from './components/PricingPage.jsx';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import OpenRoot from './components/Open/OpenRoot';
import ReportsRoot from './components/Reports/ReportsRoot';
import { getValidToken } from './api/getValidToken';
import { useProfileDataPrefetch } from './hooks/useProfileDataPrefetch';

// Lazy Load Main Components
const Home = React.lazy(() => import('./components/Home/HomeRoot.jsx'));
const SearchByRoot = React.lazy(() => import("./components/SearchBy/SearchByRoot"));
const Schedule = React.lazy(() => import('./components/Schedule/ScheduleRoot.jsx'));


const { Content } = Layout;



function AppContent() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Prefetch data when authenticated
  useProfileDataPrefetch(isAuthed);

  useEffect(() => {
    const token = getValidToken();
    const authed = !!token;
    setIsAuthed(authed);
    setLoading(false);
  }, [location.pathname]); // Re-check on nav change (optional, but good for safety)

  const handleLoginSuccess = () => {
    setIsAuthed(true);
    navigate('/search-by-root');
  };

  const handleLogout = () => {
    localStorage.removeItem("ApiToken");
    sessionStorage.removeItem("ApiToken");
    setIsAuthed(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <Layout className={isAuthed ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"}>
      {isAuthed ? (
        // Authenticated Layout: Sidebar + Content Area
        <Layout hasSider className="h-full">
          <Sidebar
            onLogout={handleLogout}
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />
          <Layout className="flex flex-col h-full bg-slate-50 transition-all duration-300 overflow-hidden">
            <Content className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className={`flex-1 flex-col flex`}>
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search-by-root" element={<SearchByRoot />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/Profile" element={<Profile />} />
                    <Route path="/work" element={<Work />} />
                    <Route path="/Order" element={<OrderPage />} />
                    <Route path="/Pricing" element={<PricingPage />} />
                    <Route path="/open" element={<OpenRoot />} />
                    <Route path="/reports" element={<ReportsRoot />} />
                    <Route path="/auth" element={<AuthPage />} />
                  </Routes>
                </Suspense>
              </div>
              <Footer />
            </Content>
          </Layout>
        </Layout>
      ) : (
        // Public Layout: Header + Content Area
        <Layout className="min-h-screen bg-white flex flex-col">
          <Header onLoginSuccess={handleLoginSuccess} />

          <Content className="flex-1 flex flex-col pt-20"> {/* pt-20 for fixed header */}
            <div className="min-h-[calc(100vh-80px)] flex flex-col">
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search-by-root" element={<SearchByRoot />} />
                  <Route path="/Profile" element={<Profile />} />
                  <Route path="/work" element={<Work />} />
                  <Route path="/Order" element={<OrderPage />} />
                  <Route path="/Pricing" element={<PricingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
          </Content>
        </Layout>
      )}
      <Chatbot />
    </Layout>
  );
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
