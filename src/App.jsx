import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import OrderPage from './components/OrderPage.jsx';
import SearchByVinPage from "./components/SearchByVinPage";
import SearchByYMMPage from "./components/SearchByYMMPage";

const { Content } = Layout;

function App()
{
  return (<Router>
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-by-vin" element={<SearchByVinPage />} />
          <Route path="/search-by-ymm" element={<SearchByYMMPage />} />
        </Routes>
      </Content>
      <Footer />
    </Layout>
  </Router>
  );
}

export default App;
