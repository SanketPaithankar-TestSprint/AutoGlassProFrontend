import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home/HomeRoot.jsx';
import OrderPage from './components/OrderPage.jsx';
import SearchByRoot from "./components/SearchBy/SearchByRoot";
import Profile from './components/profile/Profile.jsx';
import Work from './components/work/Work.jsx';
import Tasks from './components/Tasks/Tasks.jsx';
import PricingPage from './components/PricingPage.jsx';
const { Content } = Layout;
import Chatbot from './components/Chatbot';

function App() {
  return (<Router>
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-by-root" element={<SearchByRoot />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="/work" element={<Work />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/Order" element={<OrderPage />} />
          <Route path="/Pricing" element={<PricingPage />} />
        </Routes>
      </Content>
      <Footer />
      <Chatbot />
    </Layout>
  </Router>
  );
}

export default App;
