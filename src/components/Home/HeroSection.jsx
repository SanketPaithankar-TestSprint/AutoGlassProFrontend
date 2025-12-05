import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#F8F9FC] text-slate-900"
    >
      {/* Soft glow / blobs - Adjusted for light theme */}
      <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-multiply">
        <div className="absolute -top-32 -left-16 h-64 w-64 rounded-full bg-violet-200/60 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
      </div>

      {/* Content */}
      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-24 md:pt-28 md:pb-28 text-center">
        {/* Tagline */}
        <p className="text-xs md:text-sm font-semibold tracking-[0.32em] uppercase text-violet-600/90 mb-5">
          AUTO GLASS QUOTING · POWERED BY AI
        </p>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-[fadeInUp_0.7s_ease-out] text-slate-900">
          Ready to simplify your glass replacement quotes?
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg text-slate-600 mb-8 max-w-2xl mx-auto animate-[fadeInUp_0.9s_ease-out]">
          Professional B2B platform for auto glass vendors and repair shops. Generate instant quotes, manage work orders, and invoice customers—all in one place.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-[fadeInUp_1.1s_ease-out]">
          <Button
            type="primary"
            size="large"
            className="!bg-violet-600 !border-violet-600 hover:!bg-violet-500 hover:!border-violet-500 !text-white !rounded-full !px-8 !h-12 !text-base shadow-lg shadow-violet-900/20 transition-transform duration-200 hover:scale-105"
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
            className="!bg-white !border-slate-200 hover:!border-violet-400 !text-slate-700 hover:!text-violet-700 !rounded-full !px-8 !h-12 !text-base shadow-sm hover:shadow-md transition-transform duration-200 hover:scale-105"
          >
            Watch Demo
          </Button>
        </div>
      </div>

      {/* Simple keyframes (Tailwind-compatible via global CSS) */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
