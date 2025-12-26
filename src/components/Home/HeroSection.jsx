import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import Logo from "../logo";

const HeroSection = () => {
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
          className="text-xs md:text-sm font-semibold tracking-[0.32em] uppercase mb-5"
          style={{
            color: '#7E5CFE',
            animation: 'fadeInUp 0.6s ease-out 0.1s both'
          }}
        >
          AUTO GLASS QUOTING · POWERED BY AI
        </p>

        {/* Heading */}
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 text-slate-900"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
        >
          Ready to simplify your glass replacement quotes?
        </h1>

        {/* Subheading */}
        <p
          className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto"
          style={{ animation: 'fadeInUp 0.6s ease-out 0.3s both' }}
        >
          Professional B2B platform for auto glass vendors and repair shops. Generate instant quotes, manage work orders, and invoice customers—all in one place.
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
            Start Free Trial
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
          >
            Watch Demo
          </Button>
        </div>
      </div>


    </section>
  );
};

export default HeroSection;
