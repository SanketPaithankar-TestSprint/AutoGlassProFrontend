import React, { useState } from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Logo from "../logo";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";
import IpadMockup from "../../assets/ipad_landing_page_mockup.png";

const HeroSection = () => {
  const { t } = useTranslation();
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <section
      className="relative bg-transparent text-slate-900 py-0 flex justify-center items-center"
      style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
    >

      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-8 md:py-24 lg:py-32 px-3 sm:px-4 md:px-6 grid lg:grid-cols-12 gap-6 md:gap-12 items-center pt-4 md:pt-20 lg:pt-32 w-full">
        {/* Left Column: Content */}
        <div className="text-center lg:text-left lg:col-span-5 w-full">

          {/* Tagline */}
          <motion.h1
            className="text-base sm:text-2xl md:text-3xl lg:text-5xl font-extrabold mb-2 sm:mb-3 md:mb-6 leading-tight px-4 sm:px-0 break-words"
            style={{
              color: '#7E5CFE',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t('home.heroMainTitle')}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xs sm:text-sm md:text-base text-slate-600 mb-4 sm:mb-5 md:mb-8 max-w-2xl mx-auto lg:mx-0 px-4 sm:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('home.heroDescription')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-3 w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 px-4 sm:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="flex-1 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                type="primary"
                className="w-full !text-white !rounded-full !px-4 sm:!px-6 md:!px-6 !h-10 md:!h-11 !text-xs sm:!text-sm md:!text-base shadow-lg transition-all duration-200 !whitespace-normal !h-auto !py-2"
                style={{
                  backgroundColor: '#7E5CFE',
                  borderColor: '#7E5CFE',
                  boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6b47e8';
                  e.currentTarget.style.borderColor = '#6b47e8';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#7E5CFE';
                  e.currentTarget.style.borderColor = '#7E5CFE';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => {
                  navigate('/auth', { state: { mode: 'signup' } });
                }}
              >
                <span className="font-medium">{t('pricing.startFreeTrial')}</span>
              </Button>
            </motion.div>

            <motion.div
              className="flex-1 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                className="w-full !bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !rounded-full !px-4 sm:!px-6 md:!px-6 !h-10 md:!h-11 !text-xs sm:!text-sm md:!text-base shadow-sm hover:shadow-md transition-all duration-200 !whitespace-normal !h-auto !py-2"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => setIsVideoOpen(true)}
              >
                <span className="font-medium">{t('home.watchDemo')}</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile/Tablet: iPad mockup (shown below text on small screens) */}
        <div className="flex lg:hidden justify-center w-full mt-2">
          <motion.div
            className="relative w-full max-w-sm sm:max-w-md"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            <motion.img
              src={IpadMockup}
              alt="AutoGlassPro Dashboard on iPad"
              className="w-full h-auto object-contain drop-shadow-2xl relative z-10"
            />
          </motion.div>
        </div>

        {/* Desktop: Browser mockup (unchanged, slightly larger) */}
        <div className="hidden lg:flex relative lg:col-span-7 justify-center lg:justify-end">
          {/* Gradient Background - Animated separately */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[100px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)',
              willChange: 'transform, opacity'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {/* Image with slide animation */}
          <motion.div
            className="relative w-full max-w-6xl"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <motion.img
              src={BrowserMockup}
              alt="AutoGlassPro Dashboard Mockup"
              className="w-full h-auto object-contain drop-shadow-2xl relative z-10 rounded-2xl"
            />
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
};

export default HeroSection;
