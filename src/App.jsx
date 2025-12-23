import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home/HomeRoot.jsx';
import OrderPage from './components/OrderPage.jsx';
import SearchByRoot from "./components/SearchBy/SearchByRoot";
import Profile from './components/profile/Profile.jsx';
import Work from './components/work/Work.jsx';
import PricingPage from './components/PricingPage.jsx';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import OpenRoot from './components/Open/OpenRoot';
import { getValidToken } from './api/getValidToken';

const { Content } = Layout;

function AppContent() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
    <Layout className="h-screen overflow-hidden">
      {isAuthed ? (
        // Authenticated Layout: Sidebar + Content Area
        <Layout hasSider className="h-full">
          <Sidebar
            onLogout={handleLogout}
            collapsed={collapsed}
            onCollapse={setCollapsed}
          />
          <Layout className="flex flex-col h-full bg-slate-50 transition-all duration-300 overflow-hidden">
            <Content className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 md:p-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search-by-root" element={<SearchByRoot />} />
                  <Route path="/Profile" element={<Profile />} />
                  <Route path="/work" element={<Work />} />
                  <Route path="/Order" element={<OrderPage />} />
                  <Route path="/Pricing" element={<PricingPage />} />
                  <Route path="/open" element={<OpenRoot />} />
                </Routes>
              </div>
              <Footer />
            </Content>
          </Layout>
        </Layout>
      ) : (
        // Public Layout: Header + Content Area
        <Layout className="min-h-screen bg-white">
          <Header onLoginSuccess={handleLoginSuccess} />
          <Content className="flex flex-col pt-20"> {/* pt-20 for fixed header */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search-by-root" element={<SearchByRoot />} />
              <Route path="/Profile" element={<Profile />} />
              <Route path="/work" element={<Work />} />
              <Route path="/Order" element={<OrderPage />} />
              <Route path="/Pricing" element={<PricingPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
            <Footer />
          </Content>
        </Layout>
      )}
      <Chatbot />
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
