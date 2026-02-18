import React, { useState, useEffect, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Layout, App as AntApp } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import OrderPage from './components/OrderPage.jsx';
import Profile from './components/profile/Profile.jsx';

import PricingPage from './components/PricingPage.jsx';
import Chatbot from './components/Chatbot';
import Sidebar from './components/Sidebar';
import AuthRoot from './components/AuthRoot';
import OpenRoot from './components/Open/OpenRoot';
import ReportsRoot from './components/Reports/ReportsRoot';
import { getValidToken } from './api/getValidToken';
import { useProfileDataPrefetch } from './hooks/useProfileDataPrefetch';
import useInquiryNotifications from './hooks/useInquiryNotifications';
import { useAuth } from './context/auth/useAuth';
import { AuthProvider } from './context/auth/authProvide';
import { InquiryProvider } from './context/InquiryContext';

// Lazy Load Main Components
const Home = React.lazy(() => import('./components/Home/HomeRoot.jsx'));
const AnalyticsRoot = React.lazy(() => import('./components/Analytics/AnalyticsRoot.jsx'));
const CustomersRoot = React.lazy(() => import('./components/Customers/CustomersRoot.jsx'));
const SearchByRoot = React.lazy(() => import("./components/SearchBy/SearchByRoot"));
const Schedule = React.lazy(() => import('./components/Schedule/ScheduleRoot.jsx'));
const FeaturesPage = React.lazy(() => import('./components/FeaturesPage/FeaturesPage.jsx'));
const AboutPage = React.lazy(() => import('./components/About/AboutPage.jsx'));
const PublicContactRoot = React.lazy(() => import('./components/PublicContact/PublicContactRoot.jsx'));
const ServiceContactFormRoot = React.lazy(() => import('./components/ServiceContactForm/ServiceContactFormRoot.jsx'));
const ServiceInquiryView = React.lazy(() => import('./components/ServiceContactForm/ServiceInquiryView.jsx'));
const ContactPage = React.lazy(() => import('./components/ContactPage.jsx'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy.jsx'));
const EmployeeAttendance = React.lazy(() => import('./components/EmployeeAttendance/EmployeeAttendance.jsx'));
import ErrorBoundary from './components/PublicContact/ErrorBoundary';
const SitemapPage = React.lazy(() => import('./components/Sitemap/SitemapPage.jsx'));
const BlogsPage = React.lazy(() => import('./components/Blogs/BlogsPage.jsx'));
const BlogPostPage = React.lazy(() => import('./components/Blogs/BlogPostPage.jsx'));
const ShopChatPanel = React.lazy(() => import('./components/Chat/ShopChatPanel.jsx'));
import { ChatProvider } from './context/ChatContext';



const { Content } = Layout;



const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

function AppContent() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated, setIsAuthenticated } = useAuth();

  // Prefetch data when authenticated
  useProfileDataPrefetch(isAuthed);

  // Listen for inquiry notifications
  useInquiryNotifications();

  useEffect(() => {
    const token = getValidToken();
    const authed = !!token;
    setIsAuthed(authed);
    setIsAuthenticated(authed);
    setLoading(false);
  }, [location.pathname, setIsAuthenticated]); // Re-check on nav change (optional, but good for safety)

  const handleLoginSuccess = () => {
    setIsAuthed(true);
    setIsAuthenticated(true);
    navigate('/analytics');
  };

  const handleLogout = () => {
    localStorage.removeItem("ApiToken");
    sessionStorage.removeItem("ApiToken");
    setIsAuthed(false);
    setIsAuthenticated(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Check if we're on the public contact form page - render standalone without main layout
  const isContactPage = location.pathname.startsWith('/contact/');
  const isServiceView = location.pathname.startsWith('/service-inquiry-view/');

  if (isContactPage || isServiceView) {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        }>
          <Routes>
            {isContactPage && <Route path="/contact/:slug" element={<PublicContactRoot />} />}
            {isServiceView && <Route path="/service-inquiry-view/:id" element={<ServiceInquiryView />} />}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Determine if we should show the Dashboard layout (Sidebar + Content) or Public Layout (Header + Content)
  // We force Public Layout for specific pages like Privacy Policy even if logged in
  const shouldUseDashboardLayout = isAuthed && !location.pathname.startsWith('/privacy-policy');

  return (
    <Layout className={shouldUseDashboardLayout ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"}>
      {shouldUseDashboardLayout && isMobile && (
        <Header onLoginSuccess={handleLoginSuccess} />
      )}

      {shouldUseDashboardLayout ? (
        // Authenticated Layout
        <Layout className="h-full" hasSider={!isMobile}>
          {/* Show Sidebar on DESKTOP only */}
          {!isMobile && (
            <Sidebar
              key={isAuthed ? 'authed' : 'guest'}
              onLogout={handleLogout}
              collapsed={collapsed}
              onCollapse={setCollapsed}
            />
          )}

          <Layout className={`flex flex-col h-full transition-all duration-300 overflow-hidden flex-1 w-full ${isMobile ? 'pt-16' : ''}`}> {/* Add padding top for legacy header spacer if mobile */}
            <Content className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
              <div className={`flex-1 flex-col flex`}>
                <ErrorBoundary>
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                    </div>
                  }>
                    <Routes>
                      <Route path="/" element={isAuthed ? <Navigate to="/search-by-root" replace /> : <Home />} />
                      <Route path="/analytics" element={<AnalyticsRoot />} />
                      <Route path="/customers" element={<CustomersRoot />} />
                      <Route path="/search-by-root" element={<SearchByRoot />} />
                      <Route path="/schedule" element={<Schedule />} />
                      <Route path="/Profile" element={<Profile />} />

                      <Route path="/Order" element={<OrderPage />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/open" element={<OpenRoot />} />
                      <Route path="/reports" element={<ReportsRoot />} />
                      <Route path="/auth" element={<AuthRoot />} />
                      <Route path="/sitemap" element={<SitemapPage />} />
                      <Route path="/service-contact-form" element={<ServiceContactFormRoot />} />
                      <Route path="/employee-attendance" element={<EmployeeAttendance />} />
                      <Route path="/sitemap" element={<SitemapPage />} />
                      <Route path="/sitemap" element={<SitemapPage />} />
                      <Route path="/chat" element={
                        <ChatProvider isPublic={false}>
                          <ShopChatPanel />
                        </ChatProvider>
                      } />
                    </Routes >
                  </Suspense >
                </ErrorBoundary >
              </div >
              {!isAuthenticated && <Footer />
              }
            </Content >
          </Layout >
        </Layout >
      ) : (
        // Public Layout: Header + Content Area
        <Layout className="min-h-screen bg-white flex flex-col">
          <Header onLoginSuccess={handleLoginSuccess} />

          <Content className="flex-1 flex flex-col"> {/* Header is fixed provided we handle spacing in pages */}
            <div className={`flex flex-col ${location.pathname === '/auth' ? '' : 'min-h-screen'} ${(location.pathname === '/' || location.pathname === '/auth') ? '' : 'pt-20 lg:pt-24'}`}>
              <Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/search-by-root" element={<SearchByRoot />} />
                  <Route path="/Profile" element={<Profile />} />

                  <Route path="/Order" element={<OrderPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/auth" element={<AuthRoot />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:slug" element={<BlogPostPage />} />
                  <Route path="/sitemap" element={<SitemapPage />} />
                </Routes>
              </Suspense>
            </div>
            <Footer />
          </Content>
        </Layout>
      )}
      {/*  <Chatbot />*/}
    </Layout >
  );
}

const queryClient = new QueryClient();

function App() {
  // Ensure mobile viewport unit stability (fixes 100vh jitter on mobile address bar)
  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AntApp>
        <AuthProvider>
          <InquiryProvider>
            <Router>
              <AppContent />
            </Router>
          </InquiryProvider>
        </AuthProvider>
      </AntApp>
    </QueryClientProvider>
  );
}

export default App;
