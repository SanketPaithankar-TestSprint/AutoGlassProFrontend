import React, { useState } from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import Logo from "../logo";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      className="relative bg-transparent text-slate-900 py-0 flex justify-center min-h-screen items-center"
    >


      {/* Content */}
      <div className="relative max-w-7xl mx-auto py-24 lg:py-32 px-6 grid lg:grid-cols-12 gap-12 items-center pt-20 lg:pt-32">
        {/* Left Column: Content */}
        <div className="text-center lg:text-left lg:col-span-5">
          {/* Logo */}
          <div
            className="flex justify-center lg:justify-start mb-6"
            style={{ animation: 'fadeInUp 0.6s ease-out 0s both' }}
          >
            <Logo className="w-32 md:w-40 h-auto" />
          </div>

          {/* Tagline */}
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight"
            style={{
              color: '#7E5CFE',
              animation: 'fadeInUp 0.6s ease-out 0.1s both'
            }}
          >
            The Smartest Way to Run Your Auto Glass Business.
          </h1>

          {/* Subheading */}
          <p
            className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
          >
            Generate Instant, 100% Accurate Quotes through NAGS data, Streamline Field
            Service, and Manage Every Invoice—All in One Platform.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
          >
            <Button
              type="primary"
              size="large"
              className="!text-white !rounded-full !px-6 !h-11 !text-base shadow-lg transition-transform duration-200 hover:scale-105"
              style={{
                backgroundColor: '#7E5CFE',
                borderColor: '#7E5CFE',
                boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6b47e8';
                e.currentTarget.style.borderColor = '#6b47e8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#7E5CFE';
                e.currentTarget.style.borderColor = '#7E5CFE';
              }}
              onClick={() => {
                window.location.href = 'http://localhost:5173/auth';
              }}
            >
              Start Your Free Trial
            </Button>

            <Button
              size="large"
              className="!bg-white !border-slate-200 !text-slate-700 !rounded-full !px-6 !h-11 !text-base shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#7E5CFE';
                e.currentTarget.style.color = '#7E5CFE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0'; // slate-200
                e.currentTarget.style.color = '#334155'; // slate-700
              }}
              onClick={() => setIsVideoOpen(true)}
            >
              Watch a Demo
            </Button>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="hidden lg:flex relative lg:col-span-7 justify-center lg:justify-end">
          {/* Gradient Background - Animated separately */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)',
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
              className="w-full h-auto object-contain drop-shadow-2xl relative z-10 transform hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
