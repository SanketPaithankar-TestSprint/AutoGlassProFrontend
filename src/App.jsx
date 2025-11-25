import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home/HomeRoot.jsx';
import OrderPage from './components/OrderPage.jsx';
import SearchByRoot from "./components/SearchBy/SearchByRoot";
import Profile from './components/profile/Profile.jsx';
import SearchByVin from './components/SearchBy/SearchByvin.jsx';
import PricingPage from './components/PricingPage.jsx';
const { Content } = Layout;

function App()
{
  return (
    <Router>
      <Layout className="min-h-screen">
        <Header />
        <Content>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search-by-root" element={<SearchByRoot />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Search-by-vin" element={<SearchByVin />} />
            <Route path="/Pricing" element={<PricingPage />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
  );
}

export default App;
