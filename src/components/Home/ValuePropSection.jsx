import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, MessageOutlined, FormOutlined, ArrowRightOutlined, LockOutlined } from "@ant-design/icons";
import BrandButton from "../common/BrandButton";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import PrecisionImage from "../../assets/2.1.png";
import ExecuteImage from "../../assets/2.2.png";
import PaidImage from "../../assets/2.3.png";

import HomepageWorkflowImg from "../../assets/homepage_img_4.png";

// Simple hook for intersection observer
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                observer.unobserve(entry.target); // Only animate once
            }
        }, options);

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [options]);

    return [targetRef, isIntersecting];
};

const AnimatedSection = ({ children, delay = "0s", className = "" }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div
            ref={ref}
            className={`${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}`
            }}
        >
            {children}
        </div>
    );
};

const ValuePropSection = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const pillars = [
        {
            title: t('valuePropSection.pillars.quote.title'),
            focus: t('valuePropSection.pillars.quote.focus'),
            expandedDetail: t('valuePropSection.pillars.quote.detail'),
            keyBenefits: [
                t('valuePropSection.pillars.quote.b1'),
                t('valuePropSection.pillars.quote.b2'),
                t('valuePropSection.pillars.quote.b3'),
                t('valuePropSection.pillars.quote.b4')
            ],
            image: PrecisionImage
        },
        {
            title: t('valuePropSection.pillars.execute.title'),
            focus: t('valuePropSection.pillars.execute.focus'),
            expandedDetail: t('valuePropSection.pillars.execute.detail'),
            keyBenefits: [
                t('valuePropSection.pillars.execute.b1'),
                t('valuePropSection.pillars.execute.b2'),
                t('valuePropSection.pillars.execute.b3'),
                t('valuePropSection.pillars.execute.b4')
            ],
            image: ExecuteImage
        },
        {
            title: t('valuePropSection.pillars.paid.title'),
            focus: t('valuePropSection.pillars.paid.focus'),
            expandedDetail: t('valuePropSection.pillars.paid.detail'),
            keyBenefits: [
                t('valuePropSection.pillars.paid.b1'),
                t('valuePropSection.pillars.paid.b2'),
                t('valuePropSection.pillars.paid.b3'),
                t('valuePropSection.pillars.paid.b4')
            ],
            image: PaidImage
        }
    ];

    const keyFeatures = [
        {
            title: t('valuePropSection.accuracy.kf1.title'),
            desc: t('valuePropSection.accuracy.kf1.desc')
        },
        {
            title: t('valuePropSection.accuracy.kf2.title'),
            desc: t('valuePropSection.accuracy.kf2.desc')
        },
        {
            title: t('valuePropSection.accuracy.kf3.title'),
            desc: t('valuePropSection.accuracy.kf3.desc')
        }
    ];

    return (
        <>
        <div className="relative pt-24 pb-32 px-6 md:px-12 lg:px-20 overflow-hidden bg-transparent">

            {/* 1. Value Proposition Header */}
            <AnimatedSection>
                <div className="max-w-4xl mx-auto text-center mb-16 lg:mb-24 px-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] mb-6 text-[#1e293b]">
                        The <span className="text-[#7E5CFE]">APAI</span> Difference
                    </h2>
                    <p className="text-lg md:text-2xl font-bold text-[#7E5CFE] mb-6 tracking-tight">
                        {t('valuePropSection.subtitle')}
                    </p>
                    <p className="text-lg md:text-xl text-[#475569] leading-relaxed max-w-3xl mx-auto font-medium">
                        {t('valuePropSection.desc')}
                    </p>
                </div>
            </AnimatedSection>

            {/* 2. Pillars Sections (Zig-Zag Layout) */}
            <div className="flex flex-col gap-20 lg:gap-32 mb-32 max-w-7xl mx-auto">
                {pillars.map((pillar, idx) => (
                    <AnimatedSection key={idx} delay="0.1s">
                        <div className={`flex flex-col-reverse ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-24`}>

                            {/* Text Column */}
                            <div className="flex-1 space-y-8">
                                <div>
                                    <h3 className="text-3xl lg:text-4xl font-extrabold text-[#1e293b] leading-[1.1] tracking-tight">
                                        {pillar.title}
                                    </h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-5 items-start">
                                        <CheckCircleFilled className="text-3xl mt-1 text-[#7E5CFE] shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-[#1e293b] mb-2">{t('valuePropSection.coreFocus')}</h4>
                                            <p className="text-lg text-[#475569] leading-relaxed">
                                                {pillar.focus}
                                            </p>
                                        </div>
                                    </div>

                                    {pillar.expandedDetail && (
                                        <div className="pl-12">
                                            <p className="text-lg text-[#64748b] leading-relaxed italic border-l-4 border-[#7E5CFE]/20 pl-6">
                                                {pillar.expandedDetail}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-5 items-start">
                                        <CheckCircleFilled className="text-3xl mt-1 text-[#7E5CFE] shrink-0" />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-[#1e293b] mb-2">{t('valuePropSection.keyBenefitsTitle')}</h4>
                                            {pillar.keyBenefits && (
                                                <ul className="space-y-3 mt-4">
                                                    {pillar.keyBenefits.map((benefit, i) => (
                                                        <li key={i} className="text-[#475569] text-lg font-medium flex gap-3 items-center">
                                                            <div className="w-2 h-2 bg-[#7E5CFE] rounded-full shrink-0" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Column */}
                            <div className="flex-1 w-full flex justify-center">
                                <motion.div 
                                    className="relative w-full max-w-lg lg:max-w-3xl group"
                                    animate={{ y: [0, -18, 0] }}
                                    transition={{ 
                                        duration: 6, 
                                        repeat: Infinity, 
                                        ease: "easeInOut",
                                        delay: idx * 0.8
                                    }}
                                >
                                    <div className="absolute inset-0 bg-[#7E5CFE]/5 rounded-[2.5rem] blur-3xl group-hover:bg-[#7E5CFE]/10 transition-colors duration-500" />
                                    <img
                                        src={pillar.image}
                                        alt={pillar.title}
                                        className="relative w-full h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.18)] rounded-[2.5rem] transition-all duration-700 ease-out"
                                    />
                                </motion.div>
                            </div>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {/* 3. Unmatched Accuracy - New Layout */}
            <div className="max-w-7xl mx-auto mb-20 pt-16 border-t border-[#f1f5f9] relative">
                <AnimatedSection>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-[#1e293b] mb-4 tracking-[-0.03em]">
                            Unmatched <span className="text-[#7E5CFE]">Accuracy</span> from the Ground Up
                        </h2>
                        <p className="text-lg md:text-xl text-[#64748b] font-medium max-w-2xl mx-auto">
                            {t('valuePropSection.accuracy.subtitle')}
                        </p>
                    </div>
                </AnimatedSection>

                {/* Workflow Image Container */}
                <AnimatedSection delay="0.1s">
                    <div className="flex justify-center w-full mb-16">
                            <img
                                src={HomepageWorkflowImg}
                                alt="Workflow"
                                className="w-full max-w-5xl h-auto object-contain drop-shadow-2xl rounded-3xl"
                            />
                    </div>
                </AnimatedSection>

                {/* Grid Container for 3 Points */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-16 items-stretch mb-20">
                    {keyFeatures.map((feature, idx) => (
                        <AnimatedSection key={idx} delay={`${0.2 + idx * 0.1}s`} className="h-full">
                            <div className="h-full flex flex-col items-center text-center p-8 bg-[#f8fafc] rounded-3xl border border-[#f1f5f9] hover:border-[#7E5CFE]/30 transition-all duration-300">
                                <h4 className="text-xl font-black text-[#1e293b] mb-3 tracking-tight">{feature.title}</h4>
                                <p className="text-[#475569] font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        </AnimatedSection>
                    ))}
                </div>

                {/* CTA */}
                <AnimatedSection delay="0.4s">
                    <div className="text-center">
                        <BrandButton
                            type="primary"
                            onClick={() => navigate('/features')}
                            className="!rounded-full !px-12 !h-16 !text-lg !font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            {t('valuePropSection.cta')}
                        </BrandButton>
                    </div>
                </AnimatedSection>
            </div>

            {/* 4. Contact Form & AI Automation Section - Restored and Enhanced */}
            <div className="max-w-7xl mx-auto mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Contact Form Card */}
                    <AnimatedSection className="h-full">
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500 h-full">
                             <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <FormOutlined className="text-2xl text-blue-500" />
                             </div>
                             <h3 className="text-2xl font-black text-[#1e293b] mb-4">Custom Contact Form</h3>
                             <ul className="space-y-4">
                                 {['Personalized Page for each user', 'Auto-Fill YMM Fields', 'Secure database storage', 'Automatic AI response'].map((item, idx) => (
                                     <li key={idx} className="flex items-center gap-3 text-lg text-[#475569] font-medium">
                                         <CheckCircleFilled className="text-[#7E5CFE] text-xl" />
                                         {item}
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </AnimatedSection>

                    {/* AI Chatbot Card */}
                    <AnimatedSection delay="0.2s" className="h-full">
                        <div className="bg-[#f8fafc] border border-violet-100 rounded-[2rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500 h-full relative overflow-hidden">
                             <div className="absolute top-6 right-6 px-3 py-1 bg-violet-600 text-white text-xs font-black rounded-full tracking-widest uppercase">New</div>
                             <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-6">
                                <MessageOutlined className="text-2xl text-[#7E5CFE]" />
                             </div>
                             <h3 className="text-2xl font-black text-[#1e293b] mb-4">AI Chatbot Integration</h3>
                             <p className="text-[#475569] text-lg leading-relaxed font-medium">
                                An AI Chatbot integrated into your website allowing visitors to interact with the system in real time, answering queries and capturing leads 24/7.
                             </p>
                        </div>
                    </AnimatedSection>
                </div>
            </div>

            {/* 5. Security & Reliability Section - Balanced Version */}
            <AnimatedSection className="max-w-4xl mx-auto mt-16 mb-14 md:mb-16">
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow duration-500 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6">
                        <LockOutlined className="text-2xl text-[#7E5CFE]" />
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-black text-[#1e293b] mb-4 tracking-tighter leading-tight">
                        {t('aboutPage.securityTag')}:<br />
                        <span className="text-[#7E5CFE]">{t('aboutPage.dataPriorityTitle')}</span>
                    </h2>
                    
                    <p className="text-[#475569] text-base md:text-lg max-w-2xl leading-relaxed font-medium">
                        {t('aboutPage.dataPriorityDesc')}
                    </p>
                </div>
            </AnimatedSection>
        </div>

        {/* 6. Final CTA Section - Clean & Grand Finale (White BG) */}
        <section className="relative bg-white pt-12 md:pt-20 pb-24 md:pb-32 flex items-center justify-center text-center border-t border-slate-100 overflow-hidden">
            {/* Subtle aesthetic touch - minimalist grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#7E5CFE 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            
            <div className="relative z-10 max-w-6xl mx-auto px-6">
                <AnimatedSection>
                    <h2 className="!text-6xl md:!text-[6.75rem] lg:!text-[8rem] !font-normal !text-[#1e293b] mb-10 md:mb-12 !tracking-[-0.05em] !leading-[0.9]">
                        Ready to <br className="hidden md:block" />
                        <span className="text-[#7E5CFE]">Transform Your</span> <br className="hidden md:block" />
                        Business?
                    </h2>
                    
                    <p className="text-[#334155] text-3xl md:text-[2.25rem] max-w-4xl mx-auto leading-[1.35] mb-12 md:mb-16 font-semibold">
                        Run a sharper operation with accurate quotes, faster scheduling, and a smoother customer experience.
                    </p>
                    
                    <div className="flex justify-center">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.2 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <BrandButton 
                                 type="primary"
                                 className="!h-12 md:!h-14 !px-7 md:!px-10 !text-sm md:!text-base !font-semibold !rounded-full shadow-[0_10px_22px_rgba(126,92,254,0.2)] transition-all duration-300 hover:shadow-[0_14px_28px_rgba(126,92,254,0.25)]"
                                 onClick={() => navigate('/contact')}
                            >
                                <span className="flex items-center gap-2.5 md:gap-3">
                                    {t('home.ctaContactButton')}
                                    <ArrowRightOutlined className="text-lg md:text-xl" />
                                </span>
                            </BrandButton>
                        </motion.div>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    </>
    );
};

export default ValuePropSection;
