import React, { useState } from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import Logo from "../logo";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white text-slate-900 py-12 lg:py-16 flex justify-center"
    >


      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-32 items-center">
        {/* Left Column: Content */}
        <div className="text-center lg:text-left lg:col-span-4">
          {/* Logo */}
          <div
            className="flex justify-center lg:justify-start mb-6"
            style={{ animation: 'fadeInUp 0.6s ease-out 0s both' }}
          >
            <Logo className="w-48 md:w-64 h-auto" />
          </div>

          {/* Tagline */}
          <h1
            className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight"
            style={{
              color: '#7E5CFE',
              animation: 'fadeInUp 0.6s ease-out 0.1s both'
            }}
          >
            The Smartest Way to Run Your Auto Glass Business.
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0"
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
              className="!text-white !rounded-full !px-8 !h-14 !text-lg shadow-lg transition-transform duration-200 hover:scale-105"
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
                const el = document.getElementById("signup");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Start Your Free Trial
            </Button>

            <Button
              size="large"
              className="!bg-white !border-slate-200 !text-slate-700 !rounded-full !px-8 !h-14 !text-lg shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105"
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
        <div
          className="relative lg:col-span-8 flex justify-center lg:justify-end"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.5s both' }}
        >
          {/* Gradient Background */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] rounded-full blur-[120px] -z-10"
            style={{
              background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)',
              opacity: 0.3
            }}
          />
          <img
            src={BrowserMockup}
            alt="AutoGlassPro Dashboard Mockup"
            className="w-full h-auto object-contain drop-shadow-2xl relative z-10 transform hover:scale-[1.02] transition-transform duration-500 rounded-2xl"
          />
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
};

export default HeroSection;
