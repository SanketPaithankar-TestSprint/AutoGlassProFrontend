import React, { useState } from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../logo";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";

const HeroSection = () => {
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
          {/* Logo */}
          <motion.div
            className="flex justify-center lg:justify-center mb-3 sm:mb-4 md:mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Logo className="w-24 xs:w-28 sm:w-32 md:w-36 lg:w-40 h-auto" />
          </motion.div>

          {/* Tagline */}
          <motion.h1
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-0"
            style={{
              color: '#7E5CFE',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            The Smartest Way to Run Your Auto  Glass Business.
          </motion.h1>

          {/* Subheading */}
          <motion.p
            className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 mb-5 sm:mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Generate Instant, 100% Accurate Quotes through NAGS data, Streamline Field
            Service, and Manage Every Invoice—All in One Platform.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col xs:flex-row justify-center lg:justify-start gap-2 sm:gap-3 md:gap-4 w-full sm:max-w-sm lg:max-w-none mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                type="primary"
                className="w-full !text-white !rounded-full !px-4 sm:!px-6 md:!px-6 !h-10 sm:!h-11 md:!h-11 !text-xs sm:!text-sm md:!text-base shadow-lg transition-all duration-200"
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
                <span className="font-medium">Start Free Trial</span>
              </Button>
            </motion.div>

            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button
                className="w-full !bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !rounded-full !px-4 sm:!px-6 md:!px-6 !h-10 sm:!h-11 md:!h-11 !text-xs sm:!text-sm md:!text-base shadow-sm hover:shadow-md transition-all duration-200"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => setIsVideoOpen(true)}
              >
                <span className="font-medium">Watch a Demo</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Column: Image */}
        <div className="hidden lg:flex relative lg:col-span-7 justify-center lg:justify-end">
          {/* Gradient Background - Animated separately */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none"
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
            className="relative w-full max-w-5xl"
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
