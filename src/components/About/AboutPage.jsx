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
        <div className="bg-white/60 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/50 h-full hover:shadow-xl hover:shadow-violet-100/50 hover:border-violet-200 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-2xl font-bold">
                    {name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 font-outfit">{name}</h3>
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

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "APAI | About Us";
    }, []);

    const founders = [
        {
            name: "Suyog Khedekar",
            role: "Founder & Industry Visionary",
            description: "With over six years of experience owning and operating GlassFixit in the competitive California market, Suyog is the \"voice of the customer.\" He understands the nuances of NAGS codes, insurance deductibles, and the daily headaches of shop management. His mission is to solve the pricing issues and operational gaps that prevent glass shops from reaching their full potential."
        },
        {
            name: "Priyank Acharekar",
            role: "Co-founder, AI & Cloud Engineer",
            description: "Priyank is the architect behind APAI’s intelligence. An expert AI and Cloud Engineer, he brings hands-on experience in designing and deploying end-to-end Generative AI applications. With a background at TestSprint360, Priyank leverages AWS, Bedrock, and Python to ensure APAI’s backend is not only scalable and secure but also utilizes cutting-edge ML and data automation to make our quoting engine the smartest in the industry."
        },
        {
            name: "Sanket Paithankar",
            role: "Co-founder, Full-Stack & Product",
            description: "Sanket is the engine behind the APAI product experience. He owns the core engineering of the platform—from database and API design to the frontend interface. With a focus on clean architecture and high reliability, Sanket ensures that the software is fast, stable, and intuitive. He bridges the gap between complex technical requirements and the simple, easy-to-use features that shop owners and technicians rely on every day."
        }
    ];

    const targetUsers = [
        {
            title: "Shop Owners",
            desc: "Full control over multi-location operations, team management, and financial oversight.",
            icon: <GlobalOutlined />
        },
        {
            title: "Remote Installers/Mobile Service",
            desc: "The ability to run an entire job, from quote generation to payment collection, from their truck or remote location.",
            icon: <RocketOutlined />
        },
        {
            title: "Employee Teams",
            desc: "Role-based access ensures Sales, CSRs, Managers, and Technicians have tools tailored to their specific daily needs.",
            icon: <UserOutlined />
        }
    ];

    const whyChoose = [
        {
            title: "Real-World Roots",
            desc: "Designed based on years of actual shop-owner experience. We build for you, because we come from your world.",
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Enterprise-Grade Tech",
            desc: "Built with the same AI and Cloud infrastructure used by global tech leaders.",
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: "Reliability First",
            desc: "A platform that is fast, stable, and evolves with your business needs.",
            color: "bg-fuchsia-50 text-fuchsia-600"
        }
    ];

    return (
        <div className="bg-white min-h-screen pt-10 pb-20 relative overflow-hidden">
            {/* Simple static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />
            {/* Main Content Wrapper */}
            <div className="relative z-10">
                {/* 1. Header & Mission */}
                <div className="px-6 md:px-12 lg:px-20 py-12 md:py-16 max-w-7xl mx-auto text-center border-b border-slate-50">
                    <AnimatedSection>
                        <span className="inline-block py-1 px-3 mt-3 rounded-full bg-violet-100 text-violet-700 text-xs font-bold tracking-wide uppercase mb-4">
                            Our Story
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 font-outfit">
                            Built by Auto Glass Experts, <br /> Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Artificial Intelligence</span>.
                        </h1>
                    </AnimatedSection>

                    <AnimatedSection delay="0.2s">
                        <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-md border border-white/50 p-6 md:p-10 rounded-3xl mt-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Our Mission</h2>
                            <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
                                AutoPaneAI was founded to solve the core inefficiencies that plague the auto glass industry: inaccurate quotes, paper-based work orders, and slow payment cycles. We provide a single, cloud-based platform that handles the entire service flow, allowing shop owners and remote installers to focus on service delivery, not paperwork.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>

                {/* 2. Meet the Founders */}
                <div className="px-6 md:px-12 lg:px-20 py-16 bg-transparent">
                    <div className="max-w-7xl mx-auto">
                        <AnimatedSection>
                            <div className="text-center mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 font-outfit">Meet the Founders</h2>
                                <p className="text-slate-600 max-w-2xl mx-auto">The visionary team combining industry experience with cutting-edge technology.</p>
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
                        <div className="px-6 md:px-12 lg:px-20 py-20 bg-violet-50 rounded-[2.5rem] relative overflow-hidden border border-violet-100">
                            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                            <div className="relative z-10 max-w-7xl mx-auto">
                                <div className="text-center mb-16">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4 font-outfit text-slate-900">Who We Serve</h2>
                                    <p className="text-slate-600 max-w-2xl mx-auto text-lg">Empowering professionals across the entire automotive glass sector.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {targetUsers.map((user, idx) => (
                                        <AnimatedSection key={idx} delay={`${idx * 0.1}s`}>
                                            <div className="text-center group bg-white p-6 rounded-3xl border border-violet-100 shadow-sm hover:shadow-xl hover:shadow-violet-100 transition-all duration-300">
                                                <div className="h-16 w-16 mx-auto bg-violet-100 rounded-full flex items-center justify-center text-2xl text-violet-600 mb-5 group-hover:scale-110 transition-transform duration-300">
                                                    {user.icon}
                                                </div>
                                                <h3 className="text-lg font-bold mb-2 font-outfit text-slate-900">{user.title}</h3>
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
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-outfit">Why Choose APAI?</h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                                Most software companies build for "the industry." We build for <span className="font-bold text-violet-600">you</span>, because we come from your world.
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
                                        <h3 className="text-lg font-bold text-slate-900 mb-1 font-outfit">{item.title}</h3>
                                        <p className="text-slate-600 text-base">{item.desc}</p>
                                    </div>
                                </div>
                            </AnimatedSection>
                        ))}
                    </div>
                </div>

                {/* 5. Final CTA */}
                <div className="max-w-5xl mx-auto px-6 mt-24 mb-10">
                    <AnimatedSection>
                        <div className="bg-violet-50 rounded-3xl p-10 md:p-14 text-center border border-violet-100 relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-violet-700 font-bold text-sm mb-6 shadow-sm">
                                    <SafetyCertificateOutlined /> Security & Reliability
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-outfit">
                                    Your Business Data is Our Top Priority
                                </h2>
                                <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                                    All data is encrypted, securely stored in the cloud, and automatically backed up. Our role-based access control protects sensitive information, giving you peace of mind.
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                                    className="!bg-violet-600 !border-violet-600 hover:!bg-violet-500 !h-12 !px-8 !text-base !rounded-full shadow-lg shadow-violet-200"
                                >
                                    Get Started Today
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
