import React, { useState } from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import Logo from "../logo";
import VideoModal from "../VideoModal/VideoModal";

const HeroSection = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-white text-slate-900 min-h-[calc(100vh-80px)] flex justify-center"
    >


      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {/* Tagline */}
        <div
          className="flex justify-center mb-2"
          style={{ animation: 'fadeInUp 0.6s ease-out 0s both' }}
        >
          <Logo className="w-48 md:w-64 h-auto" />
        </div>
        <p
          className="text-lg md:text-4xl font-bold mb-5"
          style={{
            color: '#7E5CFE',
            animation: 'fadeInUp 0.6s ease-out 0.1s both'
          }}
        >
          The Smartest Way to Run Your Auto Glass Business.
        </p>



        {/* Subheading */}
        <p
          className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
        >
          Generate Instant, 100% Accurate Quotes through NAGS data, Streamline Field
          Service, and Manage Every Invoice—All in One Platform.
        </p>

        {/* CTA */}
        <div
          className="flex flex-col sm:flex-row justify-center gap-4"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.4s both' }}
        >
          <Button
            type="primary"
            size="large"
            className="!text-white !rounded-full !px-8 !h-12 !text-base shadow-lg transition-transform duration-200 hover:scale-105"
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
            className="!bg-white !border-slate-200 !text-slate-700 !rounded-full !px-8 !h-12 !text-base shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105"
            style={{
              // Add a subtle hover border using the brand color
            }}
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

      {/* Video Modal */}
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
    </section>
  );
};

export default HeroSection;
