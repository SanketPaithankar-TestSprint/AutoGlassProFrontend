import React from "react";
import { Button } from "antd";
import { LinkOutlined } from "@ant-design/icons";

const HeroSection = () =>
{
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
          Join thousands of auto glass shops already saving time and increasing profits.
        </p>

        {/* CTA */}
        <div className="flex justify-center animate-[fadeInUp_1.1s_ease-out]">
          <Button
            type="primary"
            size="large"
            icon={<LinkOutlined />}
            className="group relative !inline-flex !items-center !gap-2 !bg-violet-600 !border-violet-600 
                       hover:!bg-violet-500 hover:!border-violet-500 !text-base !rounded-full 
                       !py-3 !px-10 shadow-lg shadow-violet-900/40 transition-transform duration-200 
                       hover:scale-105"
            onClick={() =>
            {
              const el = document.getElementById("signup");
              if (el)
              {
                el.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <span className="relative">Get Started Free</span>
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
