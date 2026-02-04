import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";
import { CarOutlined } from "@ant-design/icons";
import { FaInstagram, FaYoutube, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { SOCIAL_LINKS, SITEMAP_LINK } from "../const/socialLinks";
import { getValidToken } from "../api/getValidToken";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

const Footer = () => {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = getValidToken();
    setIsAuthed(!!token);
  }, []);

  if (isAuthed) {
    return (
      <AntFooter className="bg-white px-4 sm:px-6 py-1">
        <div className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Left: Brand + Copy */}
          <div className="flex items-center gap-3 text-slate-400">
            <div className="flex items-center gap-2">
              <CarOutlined className="text-lg" style={{ color: "#7E5CFE" }} />
              <span className="font-semibold text-slate-800">AutoPaneAi</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>© {new Date().getFullYear()} APAI</span>
          </div>

          {/* Quick Links Section */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Home</Link>
            <Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Pricing</Link>
            <Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Features</Link>
            <Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">About</Link>
            <Link to="/contact" className="text-slate-500 hover:text-slate-800 transition-colors">Contact</Link>
            <a href={SITEMAP_LINK} className="text-slate-500 hover:text-slate-800 transition-colors" target="_blank" rel="noopener noreferrer">Sitemap</a>
            <Link to="/privacy-policy" className="text-slate-500 hover:text-slate-800 transition-colors">Privacy Policy</Link>
          </div>
          {/* Social Media Section */}
          <div className="flex items-center gap-3">
            <a href={SOCIAL_LINKS.instagram} className="text-slate-500 hover:text-pink-500 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FaInstagram size={20} />
            </a>
            <a href={SOCIAL_LINKS.youtube} className="text-slate-500 hover:text-red-500 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FaYoutube size={20} />
            </a>
            <a href={SOCIAL_LINKS.linkedin} className="text-slate-500 hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin size={20} />
            </a>
            <a href={SOCIAL_LINKS.x} className="text-slate-500 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer" aria-label="X">
              <FaXTwitter size={20} />
            </a>
          </div>
        </div>
      </AntFooter>
    );
  }

  return (
    <AntFooter
      className="bg-white px-4 sm:px-6 !pt-4 !pb-2"
    >
      <div className="mx-auto w-full max-w-6xl">


        <Row gutter={[24, 20]}>
          {/* Brand */}
          <Col xs={24} md={isAuthed ? 12 : 10} lg={isAuthed ? 12 : 10}>
            <div className="flex items-center gap-2">
              <CarOutlined className="text-xl" style={{ color: "#7E5CFE" }} />
              <span className="text-lg font-semibold tracking-tight text-slate-800">
                AutoPaneAi
              </span>
            </div>

            <Paragraph className="!text-slate-600 !mt-3 !mb-3 text-sm">
              Professional auto glass pricing &amp; quoting platform
              <br /> built for modern repair shops.
            </Paragraph>


          </Col>

          {/* Quick Links - Always show */}
          <Col xs={24} md={7} lg={7}>
            <Title level={5} className="!text-slate-800 text-sm">
              Quick Links
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Home</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Pricing</Link></li>
              <li><Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Features</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">About</Link></li>
            </ul>
          </Col>

          {/* Support */}
          <Col xs={24} md={isAuthed ? 12 : 7} lg={isAuthed ? 12 : 7}>
            <Title level={5} className="!text-slate-800 text-sm">
              Support
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/contact" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Contact</Link></li>
              <li><a href={SITEMAP_LINK} className="text-slate-500 hover:text-[#7E5CFE] transition-colors" target="_blank" rel="noopener noreferrer">Sitemap</a></li>
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Privacy Policy</Link></li>
            </ul>
            {/* Social Media Section */}
            <div className="flex items-center gap-3 mt-3">
              <a href={SOCIAL_LINKS.instagram} className="text-slate-500 hover:text-pink-500 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href={SOCIAL_LINKS.youtube} className="text-slate-500 hover:text-red-500 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube size={20} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} className="text-slate-500 hover:text-blue-700 transition-colors" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
              <a href={SOCIAL_LINKS.x} className="text-slate-500 hover:text-black transition-colors" target="_blank" rel="noopener noreferrer" aria-label="X">
                <FaXTwitter size={20} />
              </a>
            </div>
          </Col>
        </Row>

        <Divider className="!border-slate-200 !mt-5 !mb-2" />

        <div className="py-1 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} APAI. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
};

export default React.memo(Footer);
