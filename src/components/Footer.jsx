import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layout, Row, Col, Typography, Space, Divider, Button } from "antd";

import { SiYoutube, SiX, SiInstagram, SiLinkedin, SiTiktok } from "react-icons/si";
import { SOCIAL_LINKS, SITEMAP_LINK } from "../const/socialLinks";
import { getValidToken } from "../api/getValidToken";
import Logo from "./logo";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const { Footer: AntFooter } = Layout;
const { Title, Paragraph } = Typography;

const Footer = () => {
  const [isAuthed, setIsAuthed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const token = getValidToken();
    setIsAuthed(!!token);
  }, []);

  if (isAuthed) {
    return (
      <AntFooter className="bg-white px-3 sm:px-4 md:px-6 py-2 md:py-1">
        <div className="mx-auto w-full max-w-7xl flex flex-col xs:flex-row items-center justify-between gap-3 sm:gap-4 text-xs flex-wrap">
          {/* Left: Logo + Copy */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-400">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
            >
              <Logo className="w-10 sm:w-12 h-auto" />
            </motion.div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-xs sm:text-xs whitespace-nowrap">© {new Date().getFullYear()} APAI</span>
          </div>

          {/* Quick Links Section */}
          <div className="hidden md:flex items-center gap-3 md:gap-4 lg:gap-6 text-xs flex-wrap">
            <Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.home')}</Link>
            <Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.pricing')}</Link>
            <Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.features')}</Link>
            <Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.about')}</Link>
            <Link to="/contact" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide text-xs md:text-xs">{t('nav.contact')}</Link>
            <Link to="/blogs" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.blogs')}</Link>
            <Link to="/vin-decoder" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide text-xs md:text-xs">{t('nav.vinDecoder')}</Link>
            <Link to="/sitemap" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide text-xs md:text-xs">{t('nav.sitemap')}</Link>
            <Link to="/privacy-policy" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide text-xs md:text-xs">{t('nav.privacy')}</Link>
            <Link to="/terms-of-service" className="text-slate-500 hover:text-slate-800 transition-colors tracking-wide text-xs md:text-xs">{t('nav.terms')}</Link>
          </div>
          {/* Social Media Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.a
              href={SOCIAL_LINKS.youtube}
              className="hover:scale-110 transition-transform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              whileHover={{ scale: 1.2 }}
            >
              <SiYoutube size={16} className="sm:w-5 sm:h-5" color="#FF0701" />
            </motion.a>
            <motion.a
              href={SOCIAL_LINKS.x}
              className="hover:scale-110 transition-transform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
              whileHover={{ scale: 1.2 }}
            >
              <SiX size={16} className="sm:w-5 sm:h-5" color="#000000" />
            </motion.a>
            <motion.a
              href={SOCIAL_LINKS.instagram}
              className="hover:scale-110 transition-transform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              whileHover={{ scale: 1.2 }}
            >
              <SiInstagram size={16} className="sm:w-5 sm:h-5" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
            </motion.a>
            <motion.a
              href={SOCIAL_LINKS.linkedin}
              className="hover:scale-110 transition-transform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              whileHover={{ scale: 1.2 }}
            >
              <SiLinkedin size={16} className="sm:w-5 sm:h-5" color="#0A66C2" />
            </motion.a>
            <motion.a
              href={SOCIAL_LINKS.tiktok}
              className="hover:scale-110 transition-transform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              whileHover={{ scale: 1.2 }}
            >
              <SiTiktok size={16} className="sm:w-5 sm:h-5" color="#000000" />
            </motion.a>
          </div>
        </div>
      </AntFooter>
    );
  }

  return (
    <AntFooter
      className="bg-white px-3 sm:px-4 md:px-6 !pt-3 md:!pt-4 !pb-2"
    >
      <div className="mx-auto w-full max-w-6xl">
        <Row gutter={[24, 20]} className="md:gutter-[32,24]">
          {/* Brand Section */}
          <Col xs={24} sm={12} md={6} lg={6} className="ps-2 sm:ps-4 md:ps-0">
            <motion.div
              className="flex items-center gap-2 mb-2 md:mb-3"
              whileHover={{ scale: 1.05 }}
            >
              <Logo className="w-16 sm:w-20 h-auto" />
            </motion.div>

            <Paragraph className="!text-slate-600 !mt-2 md:!mt-4 !mb-4 text-xs sm:text-sm leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </Paragraph>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6} lg={6} className="ps-2 sm:ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-2 md:!mb-3 text-xs sm:text-sm font-semibold">
              {t('footer.quickLinks')}
            </Title>
            <ul className="mt-2 md:mt-3 space-y-1 md:space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.home')}</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.pricing')}</Link></li>
              <li><Link to="/features" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.features')}</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.about')}</Link></li>
            </ul>
          </Col>

          {/* Resources */}
          <Col xs={24} sm={12} md={6} lg={6} className="ps-2 sm:ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-2 md:!mb-3 text-xs sm:text-sm font-semibold">
              {t('footer.resources')}
            </Title>
            <ul className="space-y-1 md:space-y-2 text-xs sm:text-sm">
              <li><Link to="/contact" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.contact')}</Link></li>
              <li><Link to="/blogs" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.blogs')}</Link></li>
              <li><Link to="/vin-decoder" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.vinDecoder')}</Link></li>
              <li><Link to="/sitemap" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.sitemap')}</Link></li>
              <li><Link to="/privacy-policy" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.privacy')}</Link></li>
              <li><Link to="/terms-of-service" className="text-slate-500 hover:text-[#7E5CFE] transition-colors tracking-wide">{t('nav.termsOfService')}</Link></li>
            </ul>
          </Col>

          {/* Follow Us */}
          <Col xs={24} sm={12} md={6} lg={6} className="ps-2 sm:ps-4 md:ps-0">
            <Title level={5} className="!text-slate-800 !mb-2 md:!mb-3 text-xs sm:text-sm font-semibold">
              {t('footer.followUs')}
            </Title>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
              <motion.a href={SOCIAL_LINKS.youtube} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="YouTube" whileHover={{ scale: 1.2 }}>
                <SiYoutube size={18} className="sm:w-6 sm:h-6" color="#FF0000" />
              </motion.a>
              <motion.a href={SOCIAL_LINKS.x} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="X" whileHover={{ scale: 1.2 }}>
                <SiX size={18} className="sm:w-6 sm:h-6" color="#000000" />
              </motion.a>
              <motion.a href={SOCIAL_LINKS.instagram} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="Instagram" whileHover={{ scale: 1.2 }}>
                <SiInstagram size={18} className="sm:w-6 sm:h-6" style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 45%, #FCAF45 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
              </motion.a>
              <motion.a href={SOCIAL_LINKS.linkedin} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" whileHover={{ scale: 1.2 }}>
                <SiLinkedin size={18} className="sm:w-6 sm:h-6" color="#0A66C2" />
              </motion.a>
              <motion.a href={SOCIAL_LINKS.tiktok} className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" aria-label="TikTok" whileHover={{ scale: 1.2 }}>
                <SiTiktok size={18} className="sm:w-6 sm:h-6" color="#000000" />
              </motion.a>
            </div>
          </Col>
        </Row>

        <Divider className="!border-slate-200 !mt-4 md:!mt-6 !mb-2 md:!mb-3" />

        <div className="py-2 text-center text-[10px] xs:text-[11px] sm:text-xs text-slate-400">
          © {new Date().getFullYear()} APAI. {t('footer.allRightsReserved')}
        </div>
      </div>
    </AntFooter>
  );
};

export default React.memo(Footer);
