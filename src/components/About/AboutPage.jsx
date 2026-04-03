import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import {
    UserOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
    GlobalOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageHead from '../PageHead';
import { SiYoutube, SiX, SiInstagram, SiLinkedin } from "react-icons/si";

// Reusing the AnimatedSection logic for consistent animations
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                observer.unobserve(entry.target);
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

const FounderCard = ({ name, role, description, delay }) => (
    <AnimatedSection delay={delay} className="h-full">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-violet-100 h-full hover:shadow-xl hover:shadow-violet-100/50 hover:border-violet-200 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold">
                    {name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 font-black tracking-[-0.03em]">{name}</h3>
                    <p className="text-sm font-medium text-violet-600 uppercase tracking-wide">{role}</p>
                </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {description}
            </p>
        </div>
    </AnimatedSection>
);

const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const founders = t('aboutPage.founders', { returnObjects: true }) || [];

    const targetUsersTranslations = t('aboutPage.whoWeServe', { returnObjects: true }) || [];
    const targetUsers = [
        {
            title: targetUsersTranslations[0]?.title || '',
            desc: targetUsersTranslations[0]?.desc || '',
            icon: <GlobalOutlined />
        },
        {
            title: targetUsersTranslations[1]?.title || '',
            desc: targetUsersTranslations[1]?.desc || '',
            icon: <RocketOutlined />
        },
        {
            title: targetUsersTranslations[2]?.title || '',
            desc: targetUsersTranslations[2]?.desc || '',
            icon: <UserOutlined />
        }
    ];

    const whyChooseTranslations = t('aboutPage.whyChoose', { returnObjects: true }) || [];
    const whyChoose = [
        {
            title: whyChooseTranslations[0]?.title || '',
            desc: whyChooseTranslations[0]?.desc || '',
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: whyChooseTranslations[1]?.title || '',
            desc: whyChooseTranslations[1]?.desc || '',
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: whyChooseTranslations[2]?.title || '',
            desc: whyChooseTranslations[2]?.desc || '',
            color: "bg-fuchsia-50 text-fuchsia-600"
        }
    ];



    return (
        <div className="min-h-screen pt-24 pb-20 relative overflow-hidden bg-white">
            <PageHead
                title="About APAI | Empowering Independent Auto Glass Shops"
                description="Learn the story behind APAI. We're empowering independent auto glass shops with AI-driven tools to automate workflows, increase profits, and simplify scaling."
            />

            {/* Main Content Wrapper */}
            <div className="relative z-10">
                {/* 1. Header & Mission */}
                <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16 max-w-7xl mx-auto text-center border-b border-slate-50">
                    <AnimatedSection>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-black tracking-[-0.03em]">
                            {t('aboutPage.heroTitle1')} <br /> {t('aboutPage.heroTitle2')}<span style={{ color: '#7E5CFE' }}>{t('aboutPage.heroTitle3')}</span>.
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay="0.2s">
                        <div className="max-w-4xl mx-auto bg-white border border-violet-100 p-6 md:p-10 rounded-3xl mt-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">{t('aboutPage.missionTitle')}</h2>
                            <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
                                {t('aboutPage.missionText')}
                            </p>
                        </div>
                    </AnimatedSection>
                </div>

                {/* 2. Meet the Founders */}
                <div className="px-6 md:px-12 lg:px-20 py-16 bg-transparent">
                    <div className="max-w-7xl mx-auto">
                        <AnimatedSection>
                            <div className="text-center mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 font-black tracking-[-0.03em]">{t('aboutPage.foundersTitle')}</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">{t('aboutPage.foundersSubtitle')}</p>
                            </div>
                        </AnimatedSection>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {founders.map((founder, idx) => (
                                <FounderCard
                                    key={idx}
                                    {...founder}
                                    delay={`${idx * 0.1}s`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. Our Users */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-24 mb-20">
                    <AnimatedSection>
                        <div className="px-6 md:px-12 lg:px-20 py-20 bg-white rounded-[2.5rem] relative overflow-hidden border border-violet-100">
                            <div className="relative z-10 max-w-7xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-black tracking-[-0.03em] text-slate-900">{t('aboutPage.whoWeServeTitle')}</h2>
                                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">{t('aboutPage.whoWeServeSubtitle')}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {targetUsers.map((user, idx) => (
                                        <AnimatedSection key={idx} delay={`${idx * 0.1}s`}>
                                            <div className="text-center group bg-white p-6 rounded-3xl border border-violet-100 shadow-sm hover:shadow-xl hover:shadow-violet-100 transition-all duration-300">
                                                <div className="h-16 w-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center text-2xl text-violet-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                                                    {user.icon}
                                                </div>
                                                <h3 className="text-lg font-bold mb-2 font-black tracking-[-0.03em] text-slate-900">{user.title}</h3>
                                                <p className="text-slate-600 leading-relaxed text-sm">{user.desc}</p>
                                            </div>
                                        </AnimatedSection>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>

                {/* 4. Why Choose APAI */}
                <div className="px-6 md:px-12 lg:px-20 py-10 max-w-7xl mx-auto">
                    <AnimatedSection>
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-black tracking-[-0.03em]">{t('aboutPage.whyChooseTitle')}</h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                                {t('aboutPage.whyChooseSubtitle1')} <span className="font-bold text-violet-600">{t('aboutPage.whyChooseSubtitle2')}</span>{t('aboutPage.whyChooseSubtitle3')}
                            </p>
                        </div>
                    </AnimatedSection>

                    <div className="space-y-4">
                        {whyChoose.map((item, idx) => (
                            <AnimatedSection key={idx} delay={`${idx * 0.1}s`}>
                                <div className="flex items-start gap-5 p-5 md:p-6 rounded-2xl bg-white border border-slate-100 hover:shadow-lg transition-all duration-300 hover:border-violet-100">
                                    <div className={`flex-shrink-0 h-10 w-10 mt-1 rounded-full flex items-center justify-center ${item.color} font-bold`}>
                                        <CheckCircleFilled />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 font-black tracking-[-0.03em]">{item.title}</h3>
                                        <p className="text-slate-600 text-base">{item.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>

                {/* 5. Follow Our Journey */}
                <div className="px-6 md:px-12 lg:px-20 py-10 max-w-7xl mx-auto">
                    <AnimatedSection>
                        <div className="bg-white rounded-[2.5rem] p-10 md:p-12 border border-violet-100 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 font-black tracking-[-0.03em]">{t('footer.followUs')}</h2>
                                <p className="text-slate-600 max-w-md">{t('footer.tagline')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <a href="https://x.com/autopaneai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:text-black hover:bg-slate-100 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                    <SiX size={22} />
                                </a>
                                <a href="https://instagram.com/autopaneai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#E4405F] hover:bg-slate-100 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                    <SiInstagram size={22} />
                                </a>
                                <a href="https://linkedin.com/company/autopaneai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#0A66C2] hover:bg-slate-100 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                    <SiLinkedin size={22} />
                                </a>
                                <a href="https://youtube.com/@autopaneai" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 hover:text-[#FF0000] hover:bg-slate-100 transition-all border border-slate-100 shadow-sm hover:scale-110">
                                    <SiYoutube size={22} />
                                </a>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>

                {/* 6. Final CTA */}
                <div className="max-w-5xl mx-auto px-6 mt-24 mb-10">
                    <AnimatedSection>
                        <div className="bg-violet-50 rounded-3xl p-10 md:p-14 text-center border border-violet-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-violet-700 font-bold text-sm mb-6 shadow-sm">
                                    <SafetyCertificateOutlined /> {t('aboutPage.securityTag')}
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-black tracking-[-0.03em]">
                                    {t('aboutPage.dataPriorityTitle')}
                                </h2>
                                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                    {t('aboutPage.dataPriorityDesc')}
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => { window.scrollTo(0, 0); window.scroll({ top: 0, left: 0, behavior: 'smooth' }); navigate('/auth', { state: { mode: 'signup' } }); }}
                                    className="!bg-violet-600 !border-violet-600 hover:!bg-violet-500 !h-12 !px-8 !text-base !rounded-full shadow-lg shadow-violet-200"
                                >
                                    {t('aboutPage.getStartedToday')}
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
