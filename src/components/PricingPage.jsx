import React from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Button, Tooltip } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHead from "./PageHead";
import { freeTierFeatures, professionalTierFeatures, enterpriseTierFeatures } from "../const/pricingPage";


const { Content } = Layout;

const PricingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout className="flex-grow font-sans text-slate-900 flex flex-col justify-center relative overflow-hidden">
      <PageHead
        title="APAI Pricing | Transparent Auto Glass Software for $99/mo"
        description="Simple, flat-rate pricing for your auto glass shop. Get full access to VIN decoding, NAGS data, and invoicing for just $99/month. No contracts, no hidden fees."
      />

      {/* Reduced padding to ensure fit */}
      <Content className="p-4 md:p-6 flex flex-col justify-center h-full relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Compact Header */}
          <div className="text-center mb-6 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              {t('pricing.title')}
            </h1>
            <p className="text-slate-500 mb-3 text-sm">
              {t('pricing.getStartedFree')}
            </p>
            <div className="h-1 w-16 mx-auto rounded-full" style={{ background: 'linear-gradient(90deg, #00A8E4 0%, #38BDF8 100%)' }} />
          </div>

          {/* Pricing Grid - Compact Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-stretch">

            {/* CARD 1: Free Trial - Compact */}
            <div className="group w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-lg hover:shadow-2xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards] hover:-translate-y-1">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-700 mb-1">{t('pricing.freeTrial')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">{t('pricing.free')}</span>
                  <span className="text-xs font-medium text-slate-500">{t('pricing.freeTrialDays')}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  {t('pricing.freePreview')}
                </p>
              </div>

              {/* Tighter list spacing */}
              <ul className="space-y-3 mb-4 flex-1">
                {freeTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckOutlined className="mt-0.5 text-xs shrink-0" style={{ color: '#00A8E4' }} />
                    <Tooltip title={item.description} placement="top">
                      <span className="text-xs leading-snug cursor-help border-b border-dashed border-slate-300 hover:border-blue-500 transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                type="primary"
                size="middle"
                block
                className="!h-10 !rounded-lg !text-white !font-bold !border-none !text-xs shadow-md"
                style={{ backgroundColor: '#00A8E4', boxShadow: '0 4px 14px 0 rgba(0, 168, 228, 0.39)' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/auth', { state: { mode: 'signup' } }); }}
              >
                {t('pricing.startFreeTrial')}
              </Button>
            </div>



            {/* CARD 2: Professional (Highlighted) - Compact */}
            <div
              className="group w-full rounded-2xl p-4 flex flex-col relative shadow-xl transform md:scale-105 z-10 transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] hover:scale-[1.07]"
              style={{ backgroundColor: '#00A8E4', boxShadow: '0 20px 25px -5px rgba(53, 153, 207, 0.3), 0 10px 10px -5px rgba(0, 168, 228, 0.2)' }}
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {t('pricing.mostPopular')}
                </span>
              </div>

              <div className="mb-4">
                <h3 className="text-base font-bold text-white mb-1">{t('pricing.professional')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-white">$99</span>
                  <span className="text-xs font-medium text-blue-50">{t('pricing.perMonthPerUser')}</span>
                </div>
                <p className="text-blue-50 text-xs font-medium opacity-90">
                  {t('pricing.proDescription')}
                </p>
              </div>

              <ul className="space-y-3 mb-4 flex-1">
                {professionalTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <CheckOutlined className="text-blue-100 mt-0.5 text-xs shrink-0" />
                    <Tooltip title={item.description} placement="top" color="#00A8E4">
                      <span className="text-xs leading-snug opacity-95 cursor-help border-b border-dashed border-blue-300/50 hover:border-white transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                size="middle"
                block
                className="!h-10 !rounded-lg !bg-white hover:!bg-blue-50 !font-bold !border-none !text-xs shadow-lg"
                style={{ color: '#00A8E4' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/auth', { state: { mode: 'signup' } }); }}
              >
                {t('pricing.getStarted')}
              </Button>
            </div>

            {/* CARD 3: Enterprise - Standard Look */}
            <div className="group w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-lg hover:shadow-2xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards] hover:-translate-y-1">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-700 mb-1">{t('pricing.enterprise')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">{t('pricing.enterpriseCustom')}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  {t('pricing.enterpriseDesc')}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-blue-600 text-xs font-bold flex items-center gap-1.5">
                    {t('pricing.everythingInPro')}
                  </p>
                </div>
              </div>

              <ul className="space-y-3 mb-4 flex-1">
                {enterpriseTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckOutlined className="mt-0.5 text-xs shrink-0" style={{ color: '#00A8E4' }} />
                    <Tooltip title={item.description} placement="top" color="#0f172a">
                      <span className="text-xs leading-snug cursor-help border-b border-dashed border-slate-300 hover:border-blue-500 transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                size="middle"
                block
                className="!h-10 !rounded-lg !text-white !font-bold !border-none !text-xs shadow-md"
                style={{ backgroundColor: '#00A8E4', boxShadow: '0 4px 14px 0 rgba(0, 168, 228, 0.39)' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/contact'); }}
              >
                {t('pricing.contactSales')}
              </Button>
            </div>
          </div>

          {/* Reduce margin top for footer link */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs">
              {t('pricing.needHelp')} <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">{t('pricing.contactSales')}</a>
            </p>
          </div>

        </div>
      </Content>
    </Layout>
  );
};

export default PricingPage;
