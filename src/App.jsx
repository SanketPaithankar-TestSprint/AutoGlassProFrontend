import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
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
import AuthRoot from './components/auth/AuthRoot';
import OpenRoot from './components/Open/OpenRoot';
import ReportsRoot from './components/Reports/ReportsRoot';
import { getValidToken } from './api/getValidToken';
import { useProfileDataPrefetch } from './hooks/useProfileDataPrefetch';
import useScheduleNotifications from './hooks/useScheduleNotifications';
import { useAuth } from './context/auth/useAuth';
import { AuthProvider } from './context/auth/authProvide';
import { InquiryProvider, useInquiry } from './context/InquiryContext';
import { NotificationSettingsProvider } from './context/NotificationSettingsContext';
import { AIChatbotProvider } from './context/AIChatbotContext';
import { ChatWidget } from './components/AIChatbot';

// Lazy Load Main Components
const Home = React.lazy(() => import('./components/Home/HomeRoot.jsx'));
const AnalyticsRoot = React.lazy(() => import('./components/Analytics/AnalyticsRoot.jsx'));
const CustomersRoot = React.lazy(() => import('./components/Customers/CustomersRoot.jsx'));
const SearchByRoot = React.lazy(() => import("./components/SearchBy/SearchByRoot"));
const Schedule = React.lazy(() => import('./components/Schedule/ScheduleRoot.jsx'));
const FeaturesPage = React.lazy(() => import('./components/FeaturesPage/FeaturesPage.jsx'));
const FeatureSectionDetail = React.lazy(() => import('./components/FeaturesPage/FeatureSectionDetail.jsx'));
const AboutPage = React.lazy(() => import('./components/About/AboutPage.jsx'));
const PublicContactRoot = React.lazy(() => import('./components/PublicContact/PublicContactRoot.jsx'));
const ServiceContactFormRoot = React.lazy(() => import('./components/ServiceContactForm/ServiceContactFormRoot.jsx'));
const ServiceInquiryView = React.lazy(() => import('./components/ServiceContactForm/ServiceInquiryView.jsx'));
const ContactPage = React.lazy(() => import('./components/ContactPage.jsx'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy.jsx'));
const TermsOfService = React.lazy(() => import('./components/TermsOfService.jsx'));
const EmployeeAttendance = React.lazy(() => import('./components/EmployeeAttendance/EmployeeAttendance.jsx'));
import ErrorBoundary from './components/PublicContact/ErrorBoundary';
const SitemapPage = React.lazy(() => import('./components/Sitemap/SitemapPage.jsx'));
const BlogsPage = React.lazy(() => import('./components/Blogs/BlogsPage.jsx'));
const BlogPostPage = React.lazy(() => import('./components/Blogs/BlogPostPage.jsx'));
const ShopChatPanel = React.lazy(() => import('./components/Chat/ShopChatPanel.jsx'));
import { ChatProvider } from './context/ChatContext';
const SetPassword = React.lazy(() => import('./components/auth/SetPassword.jsx'));
const VinDecoderRoot = React.lazy(() => import('./components/VinDecoder/VinDecoderRoot.jsx'));
const InternalVinDecoderRoot = React.lazy(() => import('./components/InternalVinDecoder/InternalVinDecoderRoot.jsx'));
const PublicChatRoot = React.lazy(() => import('./components/PublicChat/PublicChatRoot.jsx'));
const HelpArticlesPage = React.lazy(() => import('./components/Help/HelpArticlesPage.jsx'));
const HelpArticlePage = React.lazy(() => import('./components/Help/HelpArticlePage.jsx'));
const HelpSupportPage = React.lazy(() => import('./components/Help/HelpSupportPage.jsx'));
const HelpCategoriesPage = React.lazy(() => import('./components/Help/HelpCategoriesPage.jsx'));
const SupportTicketsPage = React.lazy(() => import('./components/Help/SupportTicketsPage.jsx'));
const CallSupportPage = React.lazy(() => import('./components/Help/CallSupportPage.jsx'));
import RestrictedAccessModal from './components/RestrictedAccessModal';
import { useSubscriptionRestriction } from './hooks/useSubscriptionRestriction';




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

// ─── Scroll to Top Component ────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppContent() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Default collapsed
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const { fetchInquiryCount } = useInquiry();

  // Redirect uppercase URLs to lowercase for SEO and consistency
  useEffect(() => {
    if (location.pathname !== '/' && location.pathname !== location.pathname.toLowerCase()) {
      navigate(location.pathname.toLowerCase() + location.search + location.hash, { replace: true });
    }
  }, [location.pathname, navigate]);

  const isContactPage = /^\/contact\/[^/]+$/.test(location.pathname);
  const isChatPage = /^\/contact\/[^/]+\/chat$/.test(location.pathname);
  const isServiceView = location.pathname.startsWith('/service-inquiry-view/');
  const isSetPasswordPage = location.pathname.startsWith('/set-password');
  const isStandalonePage = isContactPage || isChatPage || isServiceView || isSetPasswordPage;

  // Prefetch data when authenticated
  useProfileDataPrefetch(isAuthed && !isStandalonePage);

  // Subscription Restriction Check
  const { showModal } = useSubscriptionRestriction(isAuthed && !isStandalonePage);

  // Only run notification hooks when authenticated and not loading
  useScheduleNotifications(isAuthed && !isStandalonePage && !loading);

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
    fetchInquiryCount();
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

  // Strip trailing slashes so /contact/ → /contact, /blogs/slug/ → /blogs/slug etc.
  if (location.pathname !== '/' && location.pathname.endsWith('/')) {
    return <Navigate to={location.pathname.replace(/\/+$/, '') + location.search + location.hash} replace />;
  }

  // Only treat /contact/:slug as the standalone public shop contact form.
  // The plain /contact page is a normal marketing page — do NOT intercept it here.
  // Tightened regex: only single-segment slugs (not /contact/:slug/chat)
  if (isStandalonePage) {
    return (
      <ErrorBoundary>
        <Suspense fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        }>
          <Routes>
            {isChatPage && <Route path="/contact/:slug/chat" element={<PublicChatRoot />} />}
            {isContactPage && <Route path="/contact/:slug" element={<PublicContactRoot />} />}
            {isServiceView && <Route path="/service-inquiry-view/:id" element={<ServiceInquiryView />} />}
            {isSetPasswordPage && <Route path="/set-password" element={<SetPassword />} />}
          </Routes>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Determine if we should show the Dashboard layout (Sidebar + Content) or Public Layout (Header + Content)
  // We force Public Layout for specific pages like Privacy Policy even if logged in
  const shouldUseDashboardLayout = isAuthed && !location.pathname.startsWith('/privacy-policy') && !location.pathname.startsWith('/terms-of-service');

  return (
    <Layout className={shouldUseDashboardLayout ? "h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"}>
      {shouldUseDashboardLayout && isMobile && (
        <Header onLoginSuccess={handleLoginSuccess} />
      )}

      <RestrictedAccessModal visible={showModal} />


      {shouldUseDashboardLayout ? (
        // Authenticated Layout
        <ChatProvider isPublic={false}>
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
                      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                      </div>
                    }>
                      <Routes>
                        <Route path="/" element={isAuthed ? <Navigate to="/quote" replace /> : <Home />} />
                        <Route path="/analytics" element={<AnalyticsRoot />} />
                        <Route path="/customers" element={<CustomersRoot />} />
                        <Route path="/quote" element={<SearchByRoot />} />
                        <Route path="/schedule" element={<Schedule />} />
                        <Route path="/profile" element={<Profile />} />

                        <Route path="/order" element={<OrderPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/features" element={<FeaturesPage />} />
                        <Route path="/features/:sectionId" element={<FeatureSectionDetail />} />
                        <Route path="/jobs" element={<OpenRoot />} />
                        <Route path="/reports" element={<ReportsRoot />} />
                        <Route path="/auth" element={<AuthRoot />} />
                        <Route path="/sitemap" element={<SitemapPage />} />
                        <Route path="/inquiries" element={<ServiceContactFormRoot />} />
                        <Route path="/attendance" element={<EmployeeAttendance />} />
                        <Route path="/sitemap" element={<SitemapPage />} />
                        <Route path="/sitemap" element={<SitemapPage />} />
                        <Route path="/vin-decoder" element={<VinDecoderRoot />} />
                        <Route path="/decoder" element={<InternalVinDecoderRoot />} />
                        <Route path="/chat" element={<ShopChatPanel />} />
                        <Route path="/sos" element={<HelpSupportPage />} />
                        <Route path="/help" element={<HelpSupportPage />}>
                          <Route path="categories" element={<HelpCategoriesPage />} />
                          <Route path="articles" element={<HelpArticlesPage />} />
                          <Route path="articles/:id" element={<HelpArticlePage />} />
                          <Route path="tickets" element={<SupportTicketsPage />} />
                          <Route path="contact" element={<CallSupportPage />} />
                        </Route>
                      </Routes >
                    </Suspense >
                  </ErrorBoundary >
                </div >
                {!isAuthenticated && <Footer />
                }
                <ChatWidget collapsed={collapsed} />
              </Content >
            </Layout >
          </Layout >
        </ChatProvider>
      ) : (
        // Public Layout: Header + Content Area
        <Layout className="min-h-screen bg-[#f8fafc] flex flex-col">
          <Header onLoginSuccess={handleLoginSuccess} />

          <Content className="flex-1 flex flex-col relative overflow-hidden"> {/* Header is fixed provided we handle spacing in pages */}
            {/* Shared Gradient Background for all public pages */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <motion.div
                className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)', willChange: 'transform, opacity' }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                style={{ background: 'linear-gradient(135deg, #00A8E4 0%, #7E5CFE 100%)', willChange: 'transform, opacity' }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />
            </div>
            <div className={`flex flex-col relative z-10 ${location.pathname === '/auth' ? '' : 'min-h-screen'} ${(location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/vin-decoder') ? '' : 'pt-16'}`}>
              <Suspense fallback={
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/features/:sectionId" element={<FeatureSectionDetail />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/quote" element={<SearchByRoot />} />
                  <Route path="/profile" element={<Profile />} />

                  <Route path="/order" element={<OrderPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/auth" element={<AuthRoot />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:slug" element={<BlogPostPage />} />
                  <Route path="/sitemap" element={<SitemapPage />} />
                  <Route path="/vin-decoder" element={<VinDecoderRoot />} />
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
          <AIChatbotProvider>
            <Router>
              <NotificationSettingsProvider>
                <InquiryProvider>
                  <ScrollToTop />
                  <AppContent />
                </InquiryProvider>
              </NotificationSettingsProvider>
            </Router>
          </AIChatbotProvider>
        </AuthProvider>
      </AntApp>
    </QueryClientProvider>
  );
}

export default App;
