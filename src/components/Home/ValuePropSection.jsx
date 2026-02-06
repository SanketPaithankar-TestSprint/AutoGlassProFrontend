import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, MessageOutlined, FormOutlined, ArrowRightOutlined, LockOutlined } from "@ant-design/icons";

import PrecisionImage from "../../assets/2.1.png";
import ExecuteImage from "../../assets/2.2.png";
import PaidImage from "../../assets/2.3.png";

import FlowImg1 from "../../assets/3.1.png";
import FlowImg2 from "../../assets/3.2.png";
import FlowImg3 from "../../assets/3.3.png";

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
                transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
                transition: `all 1s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}`
            }}
        >
            {children}
        </div>
    );
};

const ValuePropSection = () => {
    const navigate = useNavigate();
    const pillars = [
        {
            title: "Quote with Precision",
            focus: "Instant, VIN-driven NAGS part identification built specifically for auto glass professionals.",
            expandedDetail: "APAI eliminates guesswork during quoting by automatically matching vehicle VINs to the correct NAGS glass part, features, and specifications. No more manual cross-checks, outdated catalogs, or incorrect part selection that leads to rework or losses.",
            keyBenefits: [
                "Accurate windshield, back glass, and side glass identification every time",
                "Real-time NAGS data ensures correct pricing and part compatibility",
                "Reduces quoting time from minutes to seconds",
                "Prevents costly ordering and installation errors"
            ],
            image: PrecisionImage
        },
        {
            title: "Execute with Confidence",
            focus: "End-to-end digital work order management with full mobile support.",
            expandedDetail: "Move away from paper, WhatsApp notes, and fragmented systems. APAI provides a structured digital workflow from job approval to completion, accessible on mobile, tablet, or desktop — ideal for field technicians and shop managers alike.",
            keyBenefits: [
                "Create and assign work orders instantly",
                "Dispatch technicians with clear job details",
                "Track labor hours, job status, and technician progress",
                "Capture photos, signatures, and compliance documents on-site"
            ],
            image: ExecuteImage
        },
        {
            title: "Get Paid Faster",
            focus: "Automated billing, insurance tracking, and payment follow-ups.",
            expandedDetail: "APAI streamlines the most painful part of auto glass operations — payments. From invoice generation to insurance coordination and customer reminders, everything is tracked and automated so nothing slips through the cracks.",
            keyBenefits: [
                "Generate accurate invoices directly from completed work orders",
                "Track insurance claims and approval status",
                "Monitor outstanding balances in real time",
                "Send automatic payment and overdue reminders"
            ],
            image: PaidImage
        }
    ];

    const keyFeatures = [
        {
            title: "100% VIN Accuracy",
            desc: "Our integration with the NHTSA VPIC API ensures perfect vehicle identification every time, matching Year, Make, Model, and Style to the correct glass part."
        },
        {
            title: "NAGS Code Integration",
            desc: "Access the absolute complete National Auto Glass Specifications (NAGS) catalog for real-time pricing and labor hours, ensuring maximum profitability on every job."
        },
        {
            title: "Quote-to-Invoice Flow",
            desc: "Effortlessly convert an approved quote into a Work Order and finally an Invoice with a single click—no duplicate data entry."
        }
    ];

    return (
        <div className="relative py-16 md:py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
            {/* Background with Fade-in Gradient to eliminate hard edge */}
            <div
                className="absolute inset-0 -z-10 backdrop-blur-3xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 150px, rgba(255,255,255,1) 100%)'
                }}
            />

            {/* 1. Value Proposition Header */}
            <AnimatedSection>
                <div className="max-w-4xl mx-auto text-center mb-20 lg:mb-24">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-outfit text-slate-900">
                        The APAI Difference
                    </h2>
                    <p className="text-xl md:text-2xl text-violet-600 font-semibold mb-6">
                        Stop Juggling Systems. Start Growing.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                        APAI is a specialized B2B SaaS platform designed exclusively for auto glass repair shops
                        and mobile technicians to streamline the entire service lifecycle, turning quotes into paid invoices effortlessly.
                    </p>
                </div>
            </AnimatedSection>

            {/* 2. Pillars Sections (Zig-Zag Layout) */}
            <div className="flex flex-col gap-16 lg:gap-20 mb-32 max-w-7xl mx-auto">
                {pillars.map((pillar, idx) => (
                    <AnimatedSection key={idx} delay="0.1s">
                        <div className={`flex flex-col-reverse ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-16`}>

                            {/* Text Column */}
                            <div className="flex-1 space-y-6">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 leading-tight">
                                        {pillar.title}
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <CheckCircleFilled className="text-2xl mt-1 text-violet-600 shrink-0" />
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800 mb-2">Core Focus</h4>
                                            <p className="text-lg text-slate-600 leading-relaxed">
                                                {pillar.focus}
                                            </p>
                                        </div>
                                    </div>

                                    {pillar.expandedDetail && (
                                        <div className="pl-10">
                                            <p className="text-lg text-slate-600 leading-relaxed">
                                                {pillar.expandedDetail}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex gap-4 items-start">
                                        <CheckCircleFilled className="text-2xl mt-1 text-violet-600 shrink-0" />
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800 mb-2">Key Benefits</h4>
                                            {pillar.keyBenefits ? (
                                                <ul className="space-y-2 mt-2">
                                                    {pillar.keyBenefits.map((benefit, i) => (
                                                        <li key={i} className="text-lg text-slate-600 leading-relaxed flex gap-2">
                                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 shrink-0" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-lg text-slate-600 leading-relaxed">
                                                    {pillar.benefit}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Image Column */}
                            <div className="flex-1 w-full flex justify-center">
                                <div className="relative w-full max-w-sm lg:max-w-md">
                                    <img
                                        src={pillar.image}
                                        alt={pillar.title}
                                        className="w-full h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {/* 3. Unmatched Accuracy - 2x3 Grid Layout */}
            <div className="max-w-7xl mx-auto mb-24 pt-12 border-t border-slate-100 relative">
                <AnimatedSection>
                    <div className="text-center mb-20 pt-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-outfit text-slate-900">
                            Unmatched Accuracy from the Ground Up
                        </h2>
                        <p className="text-slate-500 text-lg">Everything you need to run your business efficiently</p>
                    </div>
                </AnimatedSection>

                {/* Grid Container */}
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 items-stretch">

                    {/* SVG Connector 1: Col 1 Bottom to Col 2 Top */}
                    <div className="hidden md:block absolute top-[40%] left-[25%] right-[55%] h-32 pointer-events-none z-0">
                        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                            <path d="M10 90 Q100 90 190 10" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="8 8" fill="none" />
                            <path d="M185 15 L190 10 L180 10" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                        </svg>
                    </div>

                    {/* SVG Connector 2: Col 2 Top to Col 3 Bottom */}
                    <div className="hidden md:block absolute top-[40%] left-[55%] right-[25%] h-32 pointer-events-none z-0">
                        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
                            <path d="M10 10 Q100 90 190 90" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="8 8" fill="none" />
                            <path d="M180 90 L190 90 L185 85" stroke="#CBD5E1" strokeWidth="3" fill="none" />
                        </svg>
                    </div>

                    {/* Column 1: Text Top, Image Bottom */}
                    <div className="flex flex-col gap-12 justify-between">
                        {/* Cell 1: Text */}
                        <AnimatedSection delay="0.1s" className="h-full">
                            <div className="h-full flex flex-col justify-center text-center">
                                <h4 className="text-xl font-bold text-slate-800 mb-3">{keyFeatures[0].title}</h4>
                                <p className="text-slate-600 font-medium leading-relaxed">{keyFeatures[0].desc}</p>
                            </div>
                        </AnimatedSection>
                        {/* Cell 2: Image */}
                        <AnimatedSection delay="0.2s" className="h-full">
                            <div className="flex items-center justify-center h-full relative z-10">
                                <img src={FlowImg1} alt="VIN Input" className="w-48 h-auto object-contain" />
                            </div>
                        </AnimatedSection>
                    </div>

                    {/* Column 2: Image Top, Text Bottom */}
                    <div className="flex flex-col gap-12 justify-between">
                        {/* Cell 1: Image */}
                        <AnimatedSection delay="0.3s" className="h-full">
                            <div className="flex items-center justify-center h-full relative z-10">
                                <img src={FlowImg2} alt="NAGS Code" className="w-48 h-auto object-contain" />
                            </div>
                        </AnimatedSection>
                        {/* Cell 2: Text */}
                        <AnimatedSection delay="0.4s" className="h-full">
                            <div className="h-full flex flex-col justify-center text-center">
                                <h4 className="text-xl font-bold text-slate-800 mb-3">{keyFeatures[1].title}</h4>
                                <p className="text-slate-600 font-medium leading-relaxed">{keyFeatures[1].desc}</p>
                            </div>
                        </AnimatedSection>
                    </div>

                    {/* Column 3: Text Top, Image Bottom */}
                    <div className="flex flex-col gap-12 justify-between">
                        {/* Cell 1: Text */}
                        <AnimatedSection delay="0.5s" className="h-full">
                            <div className="h-full flex flex-col justify-center text-center">
                                <h4 className="text-xl font-bold text-slate-800 mb-3">{keyFeatures[2].title}</h4>
                                <p className="text-slate-600 font-medium leading-relaxed">{keyFeatures[2].desc}</p>
                            </div>
                        </AnimatedSection>
                        {/* Cell 2: Image */}
                        <AnimatedSection delay="0.6s" className="h-full">
                            <div className="flex items-center justify-center h-full relative z-10">
                                <img src={FlowImg3} alt="Invoice" className="w-48 h-auto object-contain" />
                            </div>
                        </AnimatedSection>
                    </div>

                </div>

                {/* Vertical Arrows for Mobile */}
                <div className="md:hidden flex justify-center py-4">
                    <ArrowRightOutlined className="text-slate-300 text-2xl rotate-90" />
                </div>

                {/* CTA */}
                <div className="pt-20 text-center">
                    <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate('/features')}
                        className="!rounded-full !px-10 !h-14 !text-lg transition-transform duration-200 hover:scale-105"
                        style={{
                            backgroundColor: '#7E5CFE',
                            borderColor: '#7E5CFE',
                            boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)'
                        }}
                    >
                        See All Features
                    </Button>
                </div>

                {/* Additional Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-24">
                    {/* Custom Contact Form Card */}
                    <AnimatedSection delay="0.1s">
                        <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg relative overflow-hidden group hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-200/50 h-full">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FormOutlined style={{ fontSize: '120px', color: '#7c3aed' }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-6 font-outfit text-slate-900">Custom Contact Form</h3>
                            <ul className="space-y-4 text-slate-600 text-lg">
                                <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Personalized Page for each user</li>
                                <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Auto-Fill YMM Fields</li>
                                <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Secure database storage</li>
                                <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Automatic AI response</li>
                            </ul>
                        </div>
                    </AnimatedSection>

                    {/* AI Chatbot Card */}
                    <AnimatedSection delay="0.2s">
                        <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg relative overflow-hidden group hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-200/50 h-full">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <MessageOutlined style={{ fontSize: '120px', color: '#7c3aed' }} />
                            </div>
                            <h3 className="text-2xl font-bold mb-6 font-outfit text-slate-900 flex items-center gap-3">
                                AI Chatbot <span className="bg-violet-100 text-violet-700 text-sm px-3 py-1 rounded-full">New</span>
                            </h3>
                            <p className="text-slate-600 text-lg leading-relaxed">
                                An AI Chatbot integrated into your website allowing visitors to interact with the system in real time, answering queries and capturing leads 24/7.
                            </p>
                        </div>
                    </AnimatedSection>
                </div>

                {/* Security & Reliability Section */}
                <AnimatedSection delay="0.3s">
                    <div className="mt-20 text-center max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden group hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-200/50">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <LockOutlined style={{ fontSize: '150px', color: '#7c3aed' }} />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-4 font-outfit text-slate-900 relative z-10">
                            Security & Reliability: Your Business Data is Our Top Priority
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed relative z-10">
                            All data is encrypted, securely stored in the cloud, and automatically backed up. Our role-based access control protects sensitive information, giving you peace of mind.
                        </p>
                    </div>
                </AnimatedSection>
            </div>

        </div>
    );
};

export default ValuePropSection;
