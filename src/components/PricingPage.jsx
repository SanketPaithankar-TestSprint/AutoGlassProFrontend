import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Layout, Button, Tooltip, Switch } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import PageHead from "./PageHead";

const { Content } = Layout;

const PricingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const commonTierFeatures = t('pricing.features.common', { returnObjects: true }) || [];
  const freeTierFeaturesRaw = t('pricing.features.free', { returnObjects: true }) || [];
  const proTierFeaturesRaw = t('pricing.features.pro', { returnObjects: true }) || [];
  const enterpriseTierFeatures = t('pricing.features.enterprise', { returnObjects: true }) || [];

  const freeTierFeatures = [
    ...freeTierFeaturesRaw,
    ...commonTierFeatures,
  ];

  const professionalTierFeatures = [
    ...proTierFeaturesRaw,
    ...commonTierFeatures.map((f, i) =>
      i === 1 ? { ...f, label: t('pricing.features.unlimitedDashboard.label') } : f
    )
  ];

  return (
    <div className="flex-grow font-sans text-slate-900 flex flex-col justify-center relative bg-white overflow-hidden pt-20">
      <PageHead
        title="APAI Pricing | Transparent Auto Glass Software for $99/mo"
        description="Simple, flat-rate pricing for your auto glass shop. Get full access to VIN decoding, NAGS data, and invoicing for just $99/month. No contracts, no hidden fees."
      />

      {/* Reduced padding to ensure fit */}
      <Content className="p-2 md:p-4 flex flex-col justify-center h-full relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          {/* Compact Header */}
          <div className="text-center mb-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight mb-2">
              {t('pricing.title')}
            </h1>
            <p className="text-slate-500 mb-3 text-sm">
              {t('pricing.getStartedFree')}
            </p>

            {/* Toggle for Monthly/Yearly */}
            <div className="flex justify-center mt-3">
              <div className="flex items-center bg-white p-1.5 rounded-full shadow-sm border border-slate-100">
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-5 py-2.5 text-[14px] font-semibold rounded-full transition-all duration-300 flex items-center gap-1.5 ${isYearly ? 'shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  style={isYearly ? { backgroundColor: '#7E5CFE', color: 'white' } : {}}
                >
                  Yearly <span style={{ backgroundColor: isYearly ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '12px', fontSize: '12px', color: isYearly ? 'white' : '#64748b' }}>Save 15%</span>
                </button>
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-7 py-2.5 text-[14px] font-semibold rounded-full transition-all duration-300 ${!isYearly ? 'shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  style={!isYearly ? { backgroundColor: '#7E5CFE', color: 'white' } : {}}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Grid - Compact Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-8xl mx-auto items-stretch">

            {/* CARD 1: Free Trial - Compact */}
            <div className="group w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-lg hover:shadow-2xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards] hover:-translate-y-1">
              <div className="mb-3 min-h-[90px]">
                <h3 className="text-base font-bold text-slate-700 mb-1 mt-1">{t('pricing.freeTrial')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">{t('pricing.free')}</span>
                  <span className="text-xs font-medium text-slate-500">{t('pricing.freeTrialDays')}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  {t('pricing.freePreview')}
                </p>
              </div>

              {/* Tighter list spacing */}
              <ul className="space-y-1.5 mb-4 flex-1">
                {freeTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckOutlined className="mt-0.5 text-xs shrink-0" style={{ color: '#7E5CFE' }} />
                    <Tooltip title={item.description} placement="top">
                      <span className="text-xs leading-snug cursor-help border-b border-dashed border-slate-300 hover:border-violet-500 transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                type="primary"
                size="middle"
                block
                className="!h-10 !rounded-full !text-white !font-bold !border-none !text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#7E5CFE', boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.35)' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/auth', { state: { mode: 'signup' } }); }}
              >
                {t('pricing.startFreeTrial')}
              </Button>
            </div>



            {/* CARD 2: Professional (Highlighted) - Compact */}
            <div
              className="group w-full rounded-2xl p-4 flex flex-col relative shadow-xl transform md:scale-105 z-10 transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] hover:scale-[1.07]"
              style={{ backgroundColor: '#7E5CFE', boxShadow: '0 20px 25px -5px rgba(126, 92, 254, 0.32), 0 10px 10px -5px rgba(126, 92, 254, 0.22)' }}
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {t('pricing.mostPopular')}
                </span>
              </div>

              <div className="mb-3 min-h-[90px]">
                <h3 className="text-base font-bold !text-white mb-1 mt-1" style={{ color: '#ffffff' }}>{t('pricing.professional')}</h3>
                {isYearly ? (
                  <div className="flex flex-col mb-1 relative mt-2">
                    <div className="flex items-baseline gap-2">
                       <span className="text-3xl font-extrabold text-white">$999</span>
                       <span className="text-xs font-medium text-white/90">/year per user</span>
                    </div>
                    <div className="text-sm font-bold text-white/85 relative w-fit mt-1">
                      $1,188/year original
                      <div className="absolute left-0 top-1/2 w-full h-[2px] bg-red-500 rotate-0"></div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2 mb-1 mt-2">
                    <span className="text-3xl font-extrabold text-white">$99</span>
                    <span className="text-xs font-medium text-white/90">{t('pricing.perMonthPerUser')}</span>
                  </div>
                )}
                
                <p className="!text-white text-xs font-medium mt-1" style={{ color: '#ffffff' }}>
                  {t('pricing.proDescription')}
                </p>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {professionalTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-white">
                    <CheckOutlined className="text-white mt-0.5 text-xs shrink-0" />
                    <Tooltip title={item.description} placement="top" color="#7E5CFE">
                      <span className="text-xs leading-snug text-white cursor-help border-b border-dashed border-white/60 hover:border-white transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                size="middle"
                block
                className="!h-10 !rounded-full !bg-white hover:!bg-violet-50 !font-bold !border-none !text-xs shadow-lg transition-all hover:scale-105 active:scale-95"
                style={{ color: '#7E5CFE' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/auth', { state: { mode: 'signup' } }); }}
              >
                {t('pricing.getStarted')}
              </Button>
            </div>

            {/* CARD 3: Enterprise - Standard Look */}
            <div className="group w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col relative shadow-lg hover:shadow-2xl transition-all duration-300 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards] hover:-translate-y-1">
              <div className="mb-3 min-h-[90px]">
                <h3 className="text-base font-bold text-slate-700 mb-1 mt-1">{t('pricing.enterprise')}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-extrabold text-slate-900">{t('pricing.enterpriseCustom')}</span>
                </div>
                <p className="text-slate-500 text-xs font-medium">
                  {t('pricing.enterpriseDesc')}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[#7E5CFE] text-xs font-bold flex items-center gap-1.5">
                    {t('pricing.everythingInPro')}
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5 mb-4 flex-1">
                {enterpriseTierFeatures.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckOutlined className="mt-0.5 text-xs shrink-0" style={{ color: '#7E5CFE' }} />
                    <Tooltip title={item.description} placement="top" color="#7E5CFE">
                      <span className="text-xs leading-snug cursor-help border-b border-dashed border-slate-300 hover:border-violet-500 transition-colors">{item.label}</span>
                    </Tooltip>
                  </li>
                ))}
              </ul>

              <Button
                size="middle"
                block
                className="!h-10 !rounded-full !text-white !font-bold !border-none !text-xs shadow-md transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: '#7E5CFE', boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.35)' }}
                onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/contact'); }}
              >
                {t('pricing.contactSales')}
              </Button>
            </div>
          </div>

          {/* Reduce margin top for footer link */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs">
              {t('pricing.needHelp')} <a href="/contact" className="text-[#7E5CFE] hover:text-[#6b47e8] font-medium">{t('pricing.contactSales')}</a>
            </p>
          </div>

        </div>
      </Content>
    </div>
  );
};

export default PricingPage;
