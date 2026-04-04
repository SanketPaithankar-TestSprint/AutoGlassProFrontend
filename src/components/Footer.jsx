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

  // ─── Dashboard Footer (Minimalist Strip) ──────────────────────────────────
  if (isAuthed) {
    return (
      <AntFooter className="bg-white border-t border-slate-100 px-4 py-2.5">
        <div className="mx-auto w-full max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
              <Logo className="w-9 h-auto" />
              <span className="text-slate-300 font-light text-sm">|</span>
              <span className="text-[11px] font-medium tracking-wider text-slate-400 uppercase">
                © {new Date().getFullYear()} AutoPane AI
              </span>
            </Link>
          </div>

          {/* Practical Links */}
          <nav className="flex items-center gap-5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <Link to="/help" className="hover:text-violet-600 transition-colors uppercase">{t('nav.help') || 'Help'}</Link>
            <Link to="/privacy-policy" className="hover:text-violet-600 transition-colors uppercase">{t('nav.privacy')}</Link>
            <Link to="/terms-of-service" className="hover:text-violet-600 transition-colors uppercase">{t('nav.terms')}</Link>
          </nav>

          {/* Social Icons (Brand Colored) */}
          <div className="flex items-center gap-4">
            <motion.a href={SOCIAL_LINKS.linkedin} target="_blank" className="text-[#0A66C2] hover:opacity-85 transition-all" whileHover={{ y: -2 }}><SiLinkedin size={15} /></motion.a>
            <motion.a href={SOCIAL_LINKS.instagram} target="_blank" className="text-[#E4405F] hover:opacity-85 transition-all" whileHover={{ y: -2 }}><SiInstagram size={15} /></motion.a>
            <motion.a href={SOCIAL_LINKS.x} target="_blank" className="text-black hover:opacity-70 transition-all" whileHover={{ y: -2 }}><SiX size={15} /></motion.a>
            <motion.a href={SOCIAL_LINKS.youtube} target="_blank" className="text-[#FF0000] hover:opacity-85 transition-all" whileHover={{ y: -2 }}><SiYoutube size={15} /></motion.a>
            <motion.a href={SOCIAL_LINKS.tiktok} target="_blank" className="text-[#EE1D52] hover:opacity-85 transition-all" whileHover={{ y: -2 }}><SiTiktok size={15} /></motion.a>
          </div>
        </div>
      </AntFooter>
    );
  }

  // ─── Public Marketing Footer (Refined Minimalist) ──────────────────────────
  return (
    <AntFooter className="bg-slate-50/50 border-t border-slate-100 pt-8 pb-3 px-5">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-12 mb-5">
          
          {/* Brand Identity Column */}
          <div className="md:col-span-4 lg:col-span-5">
            <Link to="/" className="inline-block mb-3 transition-transform hover:scale-[1.02]">
              <Logo className="w-22 h-auto" />
            </Link>
            <Paragraph className="!text-slate-500 !mb-3 text-[13px] leading-relaxed max-w-sm font-medium">
              {t('footer.tagline')}
            </Paragraph>
            <div className="flex items-center gap-3">
              <motion.a href={SOCIAL_LINKS.linkedin} target="_blank" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#0A66C2] hover:border-[#0A66C2]/30 hover:shadow-md transition-all" whileHover={{ y: -3 }}><SiLinkedin size={14} /></motion.a>
              <motion.a href={SOCIAL_LINKS.instagram} target="_blank" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#E4405F] hover:border-[#E4405F]/30 hover:shadow-md transition-all" whileHover={{ y: -3 }}><SiInstagram size={14} /></motion.a>
              <motion.a href={SOCIAL_LINKS.x} target="_blank" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-black hover:border-slate-400 hover:shadow-md transition-all" whileHover={{ y: -3 }}><SiX size={14} /></motion.a>
              <motion.a href={SOCIAL_LINKS.youtube} target="_blank" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#FF0000] hover:border-[#FF0000]/30 hover:shadow-md transition-all" whileHover={{ y: -3 }}><SiYoutube size={14} /></motion.a>
              <motion.a href={SOCIAL_LINKS.tiktok} target="_blank" className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#EE1D52] hover:border-[#EE1D52]/30 hover:shadow-md transition-all" whileHover={{ y: -3 }}><SiTiktok size={14} /></motion.a>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 mb-3">{t('footer.quickLinks')}</h5>
              <ul className="space-y-2 text-[13px] font-semibold">
                <li><Link to="/" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.home')}</Link></li>
                <li><Link to="/features" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.features')}</Link></li>
                <li><Link to="/about" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.about')}</Link></li>
                <li><Link to="/pricing" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.pricing')}</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 mb-3">{t('footer.resources')}</h5>
              <ul className="space-y-2 text-[13px] font-semibold">
                <li><Link to="/blogs" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.blogs')}</Link></li>
                <li><Link to="/contact" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.contact')}</Link></li>
                <li><Link to="/vin-decoder" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.vinDecoder')}</Link></li>
                <li><Link to="/sitemap" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.sitemap')}</Link></li>
              </ul>
            </div>

            {/* Legal (Combining some small ones) */}
            <div className="col-span-2 sm:col-span-1 mt-8 sm:mt-0">
              <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-800 mb-3">Legal</h5>
              <ul className="space-y-2 text-[13px] font-semibold">
                <li><Link to="/privacy-policy" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.privacy')}</Link></li>
                <li><Link to="/terms-of-service" className="text-slate-500 hover:text-violet-600 transition-colors">{t('nav.terms')}</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-3 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-center gap-3">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © {new Date().getFullYear()} AutoPane AI. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </AntFooter>
  );
};

export default React.memo(Footer);
