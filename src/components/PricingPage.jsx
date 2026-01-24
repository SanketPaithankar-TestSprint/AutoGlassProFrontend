import React from "react";
import { Layout, Button, Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { freeTierFeatures, professionalTierFeatures } from "../const/pricingPage";

const { Content } = Layout;

const PricingPage = () => {
  return (
    <Layout className="flex-grow bg-white font-sans text-slate-900 flex flex-col justify-center">
      {/* Reduced padding to ensure fit */}
      <Content className="p-4 md:p-6 flex flex-col justify-center h-full">
        <div className="max-w-5xl mx-auto w-full">
          {/* Compact Header */}
          <div className="text-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
              Pricing
            </h1>
            <p className="text-slate-500 mb-3 text-sm">
              get started on our free plan and upgrade when you are ready.
            </p>
            <div className="h-1 w-16 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #7E5CFE 0%, #00A8E4 100%)' }} />
          </div>

          {/* Pricing Grid - Compact Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">

            {/* CARD 1: Free Trial - Compact */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col relative shadow-lg hover:shadow-2xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards] hover:-translate-y-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-700 mb-1">30-Day Free Trial</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-slate-900">Free</span>
                  <span className="text-sm font-medium text-slate-500">30 days</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  Professional Preview - No commitment.
                </p>
              </div>

              {/* Tighter list spacing */}
              <ul className="space-y-3 mb-6 flex-1">
                {freeTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckOutlined className="mt-0.5 text-xs shrink-0" style={{ color: '#7E5CFE' }} />
                    <Tooltip title={item.description} placement="top">
                      <span className="text-xs md:text-sm leading-snug cursor-help border-b border-dashed border-slate-300 hover:border-violet-500 transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                type="primary"
                size="middle"
                block
                className="!h-10 !rounded-lg !text-white !font-bold !border-none !text-sm shadow-md"
                style={{ backgroundColor: '#7E5CFE', boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)' }}
              >
                Start Free Trial
              </Button>
            </div>

            {/* CARD 2: Professional (Highlighted) - Compact */}
            <div
              className="rounded-2xl p-6 flex flex-col relative shadow-xl transform md:scale-105 z-10 transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] hover:scale-[1.07]"
              style={{ backgroundColor: '#00A8E4', boxShadow: '0 20px 25px -5px rgba(0, 168, 228, 0.3), 0 10px 10px -5px rgba(0, 168, 228, 0.2)' }}
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white mb-1">Professional</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-sm font-medium text-blue-50">per month</span>
                </div>
                <p className="text-blue-50 text-xs font-medium opacity-90">
                  Everything you need to run your auto glass quoting workflow.
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {professionalTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <CheckOutlined className="text-blue-100 mt-0.5 text-xs shrink-0" />
                    <Tooltip title={item.description} placement="top" color="#00A8E4">
                      <span className="text-xs md:text-sm leading-snug opacity-95 cursor-help border-b border-dashed border-blue-300/50 hover:border-white transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                size="middle"
                block
                className="!h-10 !rounded-lg !bg-white hover:!bg-blue-50 !font-bold !border-none !text-sm shadow-lg"
                style={{ color: '#00A8E4' }}
              >
                Get Started
              </Button>
            </div>

          </div>

          {/* Reduce margin top for footer link */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs">
              Need help choosing? <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Contact Sales</a>
            </p>
          </div>

        </div>
      </Content>
    </Layout>
  );
};

export default PricingPage;
