import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";

import { SiYoutube, SiX, SiInstagram, SiLinkedin, SiTiktok } from "react-icons/si";
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
              <span className="font-semibold text-slate-800">APAI</span>
            </div>
            <span className="hidden sm:inline">|</span>
            <span>© {new Date().getFullYear()} APAI</span>
          </div>

          {/* Quick Links Section */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Home</Link>
            <Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Pricing</Link>
            <Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Features</Link>
            <Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">About</Link>
            <Link to="/contact" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide">Contact</Link>
            <a href={SITEMAP_LINK} className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide" target="_blank" rel="noopener noreferrer">Sitemap</a>
            <Link to="/privacy-policy" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide">Privacy Policy</Link>
          </div>
          {/* Social Media Section */}
          <div className="flex items-center gap-3">
            <a href={SOCIAL_LINKS.youtube} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <SiYoutube size={20} color="#FF0701" />
            </a>
            <a href={SOCIAL_LINKS.x} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="X">
              <SiX size={20} color="#000000" />
            </a>
            <a href={SOCIAL_LINKS.instagram} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <SiInstagram size={20} style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            </a>
            <a href={SOCIAL_LINKS.linkedin} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <SiLinkedin size={20} color="#0A66C2" />
            </a>
            <a href="https://tiktok.com" className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
              <SiTiktok size={20} color="#000000" />
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
        <Row gutter={[32, 24]}>
          {/* Brand Section */}
          <Col xs={24} md={6} lg={6} className="ps-4 md:ps-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-semibold text-slate-800">APAI</span>
            </div>

            <Paragraph className="!text-slate-600 !mt-4 !mb-4 text-sm leading-relaxed max-w-sm">
              Professional auto glass pricing &amp; quoting platform
              <br /> built for modern repair shops.
            </Paragraph>
          </Col>

          {/* Quick Links */}
          <Col xs={24} md={6} lg={6} className="ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-3 text-sm font-semibold">
              Quick Links
            </Title>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Home</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Pricing</Link></li>
              <li><Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Features</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">About</Link></li>
            </ul>
          </Col>

          {/* Resources */}
          <Col xs={24} md={6} lg={6} className="ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-3 text-sm font-semibold">
              Resources
            </Title>
            <ul className="space-y-2 text-sm">
              <li><Link to="/contact" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Contact</Link></li>
              <li><a href="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors">Blogs</a></li>
              <li><a href={SITEMAP_LINK} className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide" target="_blank" rel="noopener noreferrer">Sitemap</a></li>
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">Privacy Policy</Link></li>
            </ul>
          </Col>

          {/* Follow Us */}
          <Col xs={24} md={6} lg={6} className="ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-3 text-sm font-semibold">
              Follow Us
            </Title>
            <div className="flex items-center gap-4 flex-wrap">
              <a href={SOCIAL_LINKS.youtube} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <SiYoutube size={24} color="#FF0000" />
              </a>
              <a href={SOCIAL_LINKS.x} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="X">
                <SiX size={24} color="#000000" />
              </a>
              <a href={SOCIAL_LINKS.instagram} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <SiInstagram size={24} style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 45%, #FCAF45 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
              </a>
              <a href={SOCIAL_LINKS.linkedin} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <SiLinkedin size={24} color="#0A66C2" />
              </a>
              <a href="https://tiktok.com" className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <SiTiktok size={24} color="#000000" />
              </a>
            </div>
          </Col>
        </Row>

        <Divider className="!border-slate-200 !mt-6 !mb-3" />

        <div className="py-2 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} APAI. All rights reserved.
        </div>
      </div>
    </AntFooter>
  );
};

export default React.memo(Footer);
